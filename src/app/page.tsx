"use client";
import DahsBoard from "./_components/DahsBoard";

type Item = {
  id: number;
  sha: string;
  title: string;
  body: string;
  tweet?: string;
  html_url: string;
};

const generateTweet = async (input: string) => {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    const data = (await response.json()) as { message: string };
    return data.message;
  } catch (error) {
    console.error(error);
    return "Error generating tweet";
  }
};

export default function Home() {
  const onGenerateTweet = async (item: Item): Promise<string> => {
    const input = `Title: ${item.title}
Body: ${item.body}
URL: ${item.html_url}`;
    const response = await generateTweet(input);

    console.log(response);

    return response;
  };

  // this is the view of the MarkAI application.
  // AI companion, that will generate marketing tweets, based on changes in selected items from a repository.
  return <DahsBoard onGenerateTweet={onGenerateTweet} />;
}
