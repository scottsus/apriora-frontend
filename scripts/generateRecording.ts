import fs from "fs";
import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { getAudios, getVideo, storeRecording } from "~/actions/postgres";
import ffmpeg from "fluent-ffmpeg";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME ?? "bucket";
const AUDIO_FOLDER_PREFIX = "audios/";
const VIDEO_FOLDER_PREFIX = "videos/";
const RECORDING_FOLDER_PREFIX = "recordings/";

export async function generateRecording({
  interviewId,
}: {
  interviewId: number;
}) {
  console.log("Generating recording...");

  const video = await getVideo({ interviewId });
  const audios = await getAudios({ interviewId });

  const videoUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${VIDEO_FOLDER_PREFIX}${video?.s3FileName}`,
    }),
    { expiresIn: 3600 },
  );

  const audioUrls = await Promise.all(
    audios.map((audio) =>
      getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `${AUDIO_FOLDER_PREFIX}${audio.s3FileName}`,
        }),
        { expiresIn: 3600 },
      ),
    ),
  );

  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  const filterComplex = audios
    .map(
      (audio, index) =>
        `[${index + 1}:a]adelay=${audio.startTime}|${audio.startTime}[delayed${index}]`,
    )
    .join(";");
  const mixInputs = audios.map((_, index) => `[delayed${index}]`).join("");
  const ffmpegCommand = ffmpeg()
    .input(videoUrl)
    .outputOptions([
      "-c:v copy",
      "-filter_complex",
      `${filterComplex};[0:a]${mixInputs}amix=inputs=${audios.length + 1}:duration=longest[aout]`,
      "-map 0:v",
      "-map [aout]",
      "-c:a aac",
    ]);

  audioUrls.forEach((url) => ffmpegCommand.input(url));

  const fileName = `final_${interviewId}.mp4`;
  return new Promise<string>((res, rej) => {
    ffmpegCommand
      .output(fileName)
      .on("end", () => {
        res(fileName);
      })
      .on("error", (err) => {
        console.error("generateRecording:", err);
        rej(err);
      })
      .run();
  });
}

async function uploadRecording({ fileName }: { fileName: string }) {
  console.log("Uploading recording...");

  const fileStream = fs.createReadStream(fileName);
  const fileSize = fs.statSync(fileName).size;

  // S3 minimum requirement
  const chunkSize = 5 * 1024 * 1024;

  try {
    const s3Key = `${RECORDING_FOLDER_PREFIX}${fileName}`;

    if (fileSize < chunkSize) {
      const fileContent = await fs.promises.readFile(fileName);
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ContentType: "video/mp4",
      });
      await s3Client.send(putCommand);

      return fileName;
    }

    const createCommand = new CreateMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      ContentType: "video/mp4",
    });
    const { UploadId } = await s3Client.send(createCommand);

    let partNumber = 1;
    let parts: { ETag: string; PartNumber: number }[] = [];
    let buffer = Buffer.alloc(0);

    for await (const chunk of fileStream) {
      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length >= chunkSize) {
        const uploadChunk = buffer.slice(0, chunkSize);
        buffer = buffer.slice(chunkSize);

        const uploadCommand = new UploadPartCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          PartNumber: partNumber,
          UploadId: UploadId!,
          Body: uploadChunk,
        });
        const { ETag } = await s3Client.send(uploadCommand);
        parts.push({ ETag: ETag!, PartNumber: partNumber });
        partNumber++;
      }
    }

    if (buffer.length > 0) {
      const uploadCommand = new UploadPartCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        PartNumber: partNumber,
        UploadId: UploadId!,
        Body: buffer,
      });
      const { ETag } = await s3Client.send(uploadCommand);
      parts.push({ ETag: ETag!, PartNumber: partNumber });
    }

    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      UploadId: UploadId!,
      MultipartUpload: { Parts: parts },
    });
    await s3Client.send(completeCommand);

    console.log(`Uploaded ${fileName} to S3`);
    return fileName;
  } catch (err) {
    throw new Error(`uploadRecording: ${err}`);
  }
}

function main() {
  if (process.argv.length !== 3) {
    console.error(`Incorrect usage. Command:

    tsx --env-file=.env scripts/generateRecording.ts {INTERVIEW_ID}
    
Please try again.`);
    return;
  }
  const interviewId = parseInt(process.argv[2] ?? "", 10);
  if (isNaN(interviewId)) {
    console.error("Please provide a valid interviewId:", interviewId);
    return;
  }

  generateRecording({ interviewId })
    .then((fileName) => uploadRecording({ fileName }))
    .then((fileName) => storeRecording({ interviewId, fileName }))
    .then((fileName) => {
      console.log(`✨ Saved ${fileName} in the cloud and Postgres.`);

      //   const filePath = `./${fileName}`;
      //   fs.unlink(filePath, (err) => {
      //     if (err) {
      //       console.error(`Error deleting file ${filePath}:`, err);
      //     }
      //   });
    })
    .catch((err) => console.error(err));
}

main();
