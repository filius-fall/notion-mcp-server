import { Client } from "@notionhq/client";

export const getNotionConfig = () => {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN is required");
  }

  const notionVersion = process.env.NOTION_API_VERSION ?? "2022-06-28";

  return {
    token,
    notionVersion,
  };
};

export const createNotionClient = () => {
  const { token, notionVersion } = getNotionConfig();
  return new Client({ auth: token, notionVersion });
};
