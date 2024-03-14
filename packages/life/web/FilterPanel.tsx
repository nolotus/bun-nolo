import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Select } from "ui";
import { getDomains } from "app/domains";

export const FilterPanel = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [tagsFilter, setTagsFilter] = useState<string>("");

  const domains = useMemo(() => getDomains(), []);
  const sourceOptions = useMemo(
    () => ["All", ...domains.map((domain) => domain.source)],
    [domains],
  );
  // 假设getTags是获取标签的函数，可能需要你自己实现
  const tags = useMemo(() => getTags(), []);
  const tagsOptions = useMemo(() => ["All", ...tags], [tags]);

  useEffect(() => {
    setSourceFilter(searchParams.get("source") || "");
    setTagsFilter(searchParams.get("tags") || "");
  }, [searchParams]);

  useEffect(() => {
    setSearchParams({
      source: sourceFilter,
      tags: tagsFilter,
    });
  }, [sourceFilter, tagsFilter, setSearchParams]);

  // 注意：实际过滤数据逻辑需要你自己实现
  const filteredData: any[] = []; // 将你的过滤数据逻辑放置于此

  return (
    <Card className="my-4 p-4 shadow-lg">
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="source" className="text-sm font-medium text-gray-700">
            Source:
          </label>
          <Select
            id="source"
            value={sourceFilter}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setSourceFilter(event.target.value)
            }
            options={sourceOptions}
            placeholder="Select source"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="tags" className="text-sm font-medium text-gray-700">
            Tags:
          </label>
          <Select
            id="tags"
            value={tagsFilter}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setTagsFilter(event.target.value)
            }
            options={tagsOptions}
            placeholder="Select tags"
          />
        </div>
      </div>
    </Card>
  );
};

// 示例：假设你有一个getTags函数获取标签，这里暂时用一个固定数组模拟
function getTags() {
  return ["Tag1", "Tag2", "Tag3"]; // 请替换为实际的获取标签的逻辑
}
