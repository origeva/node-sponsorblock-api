import { VideoID } from "src/apis/first/utils";
import { Category } from "./Category";

export type categoryLock = {
  videoID: VideoID,
  hash: string,
  categories: Category[]
}