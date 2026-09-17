import { createContext } from "react";
import type { PostContextType } from "../types";

export const PostContext = createContext<PostContextType | undefined>(
  undefined,
);
