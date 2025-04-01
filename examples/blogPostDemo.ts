import { z } from "zod";
import { AsyncMaybe } from "../src/index";

const postSchema = z.object({
  title: z.string().min(10).max(100),
  content: z.string().min(100),
  tags: z.array(z.string().max(15)).max(5),
  publishDate: z.date().min(new Date())
});

type Post = z.infer<typeof postSchema>;

const invalidPost: any = {
  title: "Short",
  content: "Too brief...",
  tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  publishDate: new Date("2020-01-01")
};

AsyncMaybe<Post>((d: Post) => d.title, postSchema ) (Promise.resolve(invalidPost))
  .then(([postErr]) => {
    console.log('Blog Post Errors:', postErr);
  });