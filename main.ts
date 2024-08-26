import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import { db } from "~/server/db";
import { audios, videos } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import ffmpeg from "fluent-ffmpeg";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = "apriora-bucket";

async function main(interviewId: number) {
  const [video] = await db
    .select()
    .from(videos)
    .where(eq(videos.interviewId, interviewId));
  const recordedAudios = await db
    .select()
    .from(audios)
    .where(eq(audios.interviewId, interviewId))
    .orderBy(audios.startTime);

  if (!video || !recordedAudios) {
    console.error("No video or audio");
    return;
  }

  // Generate signed URLs
  const videoUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `recordings/${video.s3FileName}`,
    }),
    { expiresIn: 3600 },
  );

  const audioUrls = await Promise.all(
    recordedAudios.map((audio) =>
      getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `audio/${audio.s3FileName}`,
        }),
        { expiresIn: 3600 },
      ),
    ),
  );

  // Set the FFmpeg path
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);

  // Prepare filter complex string
  const filterComplex = recordedAudios
    .map(
      (audio, index) =>
        `[${index + 1}:a]adelay=${audio.startTime}|${audio.startTime}[delayed${index}]`,
    )
    .join(";");

  const mixInputs = recordedAudios
    .map((_, index) => `[delayed${index}]`)
    .join("");

  const ffmpegCommand = ffmpeg()
    .input(videoUrl)
    .outputOptions([
      "-c:v copy",
      "-filter_complex",
      `${filterComplex};[0:a]${mixInputs}amix=inputs=${recordedAudios.length + 1}:duration=longest[aout]`,
      "-map 0:v",
      "-map [aout]",
      "-c:a aac",
    ]);

  // Add audio inputs dynamically
  audioUrls.forEach((url) => ffmpegCommand.input(url));

  ffmpegCommand
    .output("mixer/mixed.mp4")
    .on("end", () => {
      console.log("Audio mixing completed!");
    })
    .on("error", (err) => {
      console.error("An error occurred:", err.message);
    })
    .run();

  console.log(
    `Mixing video with ${recordedAudios.length} delayed audio files...`,
  );
}

main(3);
