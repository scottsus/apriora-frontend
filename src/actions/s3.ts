"use server";

import {
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export async function getRecordingUrl(fileName: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${RECORDING_FOLDER_PREFIX}${fileName}`,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return signedUrl;
  } catch (err) {
    console.error("getRecording:", err);
    return "";
  }
}

export async function listRecordingUrls(): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: RECORDING_FOLDER_PREFIX,
  });

  try {
    const response = await s3Client.send(command);
    const recordingKeys =
      response.Contents?.map((item) => item.Key as string).filter((key) =>
        key.endsWith(".mp4"),
      ) ?? [];

    const videoUrls = await Promise.all(
      recordingKeys.map(async (key) => {
        const getCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        });
        return getSignedUrl(s3Client, getCommand, {
          expiresIn: 3600,
        });
      }),
    );

    return videoUrls;
  } catch (err) {
    console.error("listRecordings:", err);
    return [];
  }
}

export async function uploadVideo(formData: FormData): Promise<{
  uploadId?: string;
  etag?: string;
  parts?: { ETag: string; PartNumber: number }[];
}> {
  try {
    const fileName = formData.get("fileName") as string;
    const totalParts = parseInt(formData.get("totalParts") as string, 10);
    const partNumber = parseInt(formData.get("partNumber") as string, 10);
    let uploadId = formData.get("uploadId") as string | undefined;
    let parts = formData.get("parts")
      ? JSON.parse(formData.get("parts") as string)
      : [];
    const data = await (formData.get("data") as Blob).arrayBuffer();

    if (partNumber === 1) {
      const createCommand = new CreateMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: `${VIDEO_FOLDER_PREFIX}${fileName}`,
        ContentType: "video/webm",
      });
      const { UploadId } = await s3Client.send(createCommand);
      uploadId = UploadId;
      parts = [];
    }

    if (!uploadId) {
      throw new Error("UploadId is required for parts after the first");
    }
    if (!data) {
      throw new Error("Data is null");
    }

    const uploadCommand = new UploadPartCommand({
      Bucket: BUCKET_NAME,
      Key: `${VIDEO_FOLDER_PREFIX}${fileName}`,
      PartNumber: partNumber,
      UploadId: uploadId,
      Body: new Uint8Array(data),
      ContentLength: data.byteLength,
    });
    const { ETag } = await s3Client.send(uploadCommand);

    parts.push({ ETag: ETag!, PartNumber: partNumber });

    if (partNumber === totalParts) {
      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: BUCKET_NAME,
        Key: `${VIDEO_FOLDER_PREFIX}${fileName}`,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      });
      await s3Client.send(completeCommand);
      return {};
    }

    return { uploadId, etag: ETag, parts };
  } catch (error) {
    throw new Error(`uploadVideo: ${error}`);
  }
}

export async function uploadAudio({
  audioFile,
  fileName,
}: {
  audioFile: File;
  fileName: string;
}) {
  const arrayBuffer = await audioFile.arrayBuffer();

  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `${AUDIO_FOLDER_PREFIX}${fileName}`,
      Body: Buffer.from(arrayBuffer),
      ContentType: audioFile.type,
    });
    await s3Client.send(command);
  } catch (err) {
    console.error("uploadAudio", err);
  }
}
