import { VideoID } from "src/api/impl/utils";
import { Category } from "./Category";

export type categoryLock = {
  videoID: VideoID,
  hash: string,
  categories: Category[],
  reason: string
}