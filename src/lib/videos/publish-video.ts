import {
  executePublishVideoMutation,
  type PublishVideoArgs,
  type PublishVideoResult,
} from "@/lib/mutations/videos/publish-video-mutation";

export async function publishVideo(
  args: PublishVideoArgs,
): Promise<PublishVideoResult> {
  return executePublishVideoMutation(args);
}
