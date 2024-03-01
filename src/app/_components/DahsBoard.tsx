"use client";
import { useCallback, useEffect, useRef, useState } from "react";

async function fetchItems(repository: string, isPulls = false) {
  const response = await fetch(
    `https://api.github.com/repos/${repository}/${isPulls ? "pulls" : "commits"}?state=closed`,
    {
      headers: {
        Accept: "application/vnd.github.raw+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  return response.json() as Promise<Item[]>;
}

type SearchResultsProps = {
  onAddRepositoryItems: (repository: string) => void;
};

const SearchResults: React.FC<SearchResultsProps> = ({
  onAddRepositoryItems,
}) => {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <label className="input input-bordered flex w-full items-center gap-2 md:w-96">
          <input
            type="text"
            className="grow"
            placeholder="USERNAME/REPOSITORY"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>

        <button
          onClick={() => onAddRepositoryItems(search)}
          className="btn btn-primary w-full md:w-auto"
        >
          Add repository
        </button>
      </div>
    </div>
  );
};

type Item = {
  id: number;
  sha: string;
  title: string;
  body: string;
  tweet?: string;
  html_url: string;
  commit: {
    message: string;
  };
};

type Tweet = {
  url: string;
  tweet: string;
};

type DahsBoardProps = {
  onGenerateTweet: (item: Item) => Promise<string>;
};

const DahsBoard: React.FC<DahsBoardProps> = ({ onGenerateTweet }) => {
  const isInitialMount = useRef(true);

  const [repository, setRepository] = useState("");
  // get from localstorage
  const [items, setItems] = useState<Item[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isPulls, setIsPulls] = useState<boolean>(false);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      // Your useEffect code here to be run on update
      let repository = "";
      try {
        repository = JSON.parse(localStorage.getItem("repository") ?? '') as string;
      } catch (error) {
        console.error(error);
      }

      const tweets = JSON.parse(
        localStorage.getItem("tweets") ?? "[]",
      ) as Tweet[];

      if (Boolean(tweets)) {
        setTweets(tweets);
      }

      if (Boolean(repository)) {
        setRepository(repository);
      }
    }
  }, []);

  const setNewItems = useCallback(
    (items: Item[]) => {
      const newItems = items.map((item) => {
        return {
          ...item,
          body: isPulls ? item.body : item.commit.message,
        };
      });

      setItems(newItems);
    },
    [isPulls],
  );

  useEffect(() => {
    if (repository) {
      fetchItems(repository, isPulls)
        .then((items) => {
          if (Array.isArray(items) && items.length > 0) {
            setNewItems(items);
          } else {
            alert(
              "No pull requests found. Please try another repository or check the repository name.",
            );
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [repository, isPulls, setNewItems]);

  const onAddRepositoryItems = async (repository: string) => {
    setRepository(repository);
    localStorage.setItem("repository", JSON.stringify(repository));

    const items = await fetchItems(repository);
    if (Array.isArray(items) && items.length > 0) {
      setNewItems(items);
    }
  };

  const onRemove = () => {
    setRepository("");
    setItems([]);
    localStorage.removeItem("repository");
  };

  const onGenerateTweetClick = async (item: Item) => {
    const tweet = await onGenerateTweet(item);
    storeTweet(item.html_url, tweet);
  };

  const storeTweet = (url: string, tweet: string) => {
    // find and update the tweet or add a new tweet
    const newTweets = [...tweets, { url, tweet }];
    setTweets(newTweets);
    localStorage.setItem("tweets", JSON.stringify(newTweets));
  };

  const getStoredTweet = (url: string) => {
    const tweetReversed = tweets.reverse();
    const tweet = tweetReversed.find((t) => t.url === url);
    return tweet?.tweet;
  };

  const itemsCombined = items.map((item) => {
    const tweet = getStoredTweet(item.html_url);
    return { ...item, tweet };
  });

  const onTweetClick = (body: string) => {
    const text = body.replaceAll("#", "%23");
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, "_blank");
  };

  // this is the view of the MarkAI application.
  // AI companion, that will generate marketing tweets, based on changes in selected items from a repository.
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="container flex flex-col  gap-12 p-4 ">
        <div className="navbar rounded-box bg-neutral text-gray-100 shadow-xl">
          <a className="btn btn-ghost text-xl">MarkAI</a>
        </div>

        <div>
          <div className="form-control">
            <label className="label flex cursor-pointer items-center justify-start gap-2">
              <span className="label-text">Commits</span>
              <input
                type="checkbox"
                className="toggle"
                checked={isPulls}
                onChange={() => setIsPulls(!isPulls)}
              />
              <span className="label-text">Pulls</span>
            </label>
          </div>
          <SearchResults onAddRepositoryItems={onAddRepositoryItems} />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="card w-full bg-primary text-primary-content shadow-lg md:w-96">
            <div className="card-body p-5">
              <h2 className="card-title">Welcome to MarkAI</h2>
              <p>
                MarkAI is a tool that helps you to create and manage your tweets
                about your repository.
              </p>
              
            </div>
          </div>

          {/* Github repository name/badge/tag and a close button */}
          {repository && (
            <div className="card w-full shadow-lg md:w-96">
              <div className="card-body p-5">
                <h2 className="card-title">Repository</h2>
                <div className="flex items-center justify-between">
                  <div className="badge badge-primary badge-outline">
                    {repository}
                  </div>
                  <button onClick={onRemove} className="btn btn-ghost">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-2 px-4 text-2xl">Recent items</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Items */}
            {itemsCombined.length === 0 && (
              <p className="px-4">No items found. Please add a repository.</p>
            )}
            {itemsCombined.map((item, index) => (
              <div key={index} className="card card-bordered">
                <div className="card-body p-5">
                  <p className="card-title line-clamp-2">{item.title}</p>
                  <p className="prose line-clamp-3 text-gray-500">
                    {item.body}
                  </p>
                  <p></p>

                  <div className="card-actions">
                    {!item.tweet && (
                      <button
                        className="btn"
                        onClick={() => onGenerateTweetClick(item)}
                      >
                        Generate tweet
                      </button>
                    )}
                  </div>

                  {item.tweet && (
                    <>
                      <div className="card card-bordered">
                        <div className="card-body p-4">
                          <p>{item.tweet}</p>

                          <div className="card-actions">
                            <button
                              onClick={() =>
                                item.tweet && onTweetClick(item.tweet)
                              }
                              className="btn btn-outline text-primary"
                            >
                              Tweet
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default DahsBoard;
