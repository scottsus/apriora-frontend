"use server";

import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = "apriora-bucket";
const FOLDER_PREFIX = "recordings/";

export async function listRecordings(): Promise<string[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: FOLDER_PREFIX,
  });

  try {
    const response = await s3Client.send(command);
    const videoKeys =
      response.Contents?.map((item) => item.Key as string).filter((key) =>
        key.endsWith(".webm"),
      ) ?? [];

    const videoUrls = await Promise.all(
      videoKeys.map(async (key) => {
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
  } catch (error) {
    console.error("Error listing videos or generating URLs:", error);
    throw new Error("Failed to list videos or generate URLs");
  }
}
