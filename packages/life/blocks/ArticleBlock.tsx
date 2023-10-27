import React from "react";
import { Link } from "react-router-dom";
import { handleOperations } from "../operations";
import { useAuth } from "app/hooks";

const ArticleBlock = ({ articles, refreshData }) => {
  const auth = useAuth();
  const handleButtonClick = (operation, article) => {
    handleOperations(
      operation,
      article.key,
      article.value,
      refreshData,
      auth.user?.userId
    );
  };

  const truncateContent = (content) => {
    return content.length > 50 ? content.substring(0, 50) + "..." : content;
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Articles</h2>
      <div className="space-y-4">
        {articles
          ? articles.map((article) => (
              <div
                key={article.key}
                className="flex justify-between items-center"
              >
                <div>
                  <h3>
                    <Link to={`/${article.key}`}>{article.value.title}</Link>
                  </h3>
                  <p>{truncateContent(article.value.content)}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleButtonClick("delete", article)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleButtonClick("syncToNolotus", article)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    Sync to Nolotus
                  </button>
                  <button
                    onClick={() =>
                      handleButtonClick("syncFromNolotus", article)
                    }
                    className="bg-yellow-500 text-white px-4 py-2 rounded"
                  >
                    Sync from Nolotus
                  </button>
                </div>
              </div>
            ))
          : "Loading articles..."}
      </div>
    </div>
  );
};

export default ArticleBlock;
