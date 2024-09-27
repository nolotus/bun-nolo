import { useAppDispatch } from "app/hooks";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Select } from "render/ui";
import { SortDescIcon } from "@primer/octicons-react";
import { setSortKey, setSortOrder } from "../lifeSlice";

export const FilterPanel = () => {
  const dispatch = useAppDispatch();
  let [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    dispatch(setSortKey(searchParams.get("sortKey") || ""));
    dispatch(setSortOrder(searchParams.get("sortOrder") || ""));
  }, []);

  const handleSortKeyChange = (event) => {
    dispatch(setSortKey(event.target.value));
    setSearchParams({ sortKey: event.target.value });
  };

  const handleSortOrderChange = (event) => {
    dispatch(setSortOrder(event.target.value));
    setSearchParams({ sortOrder: event.target.value });
  };

  return (
    <div
      style={{
        padding: "16px",
        marginTop: "16px",
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <label
            htmlFor="sortKey"
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Sort Key:
          </label>
          <input
            id="sortKey"
            onChange={handleSortKeyChange}
            placeholder="Enter key to sort"
            style={{
              width: "100%",
              borderRadius: "4px",
              border: "1px solid #D1D5DB",
              padding: "8px",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              outline: "none",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <label
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <SortDescIcon size={24} />
            Sort Order:
          </label>
          <Select
            id="sortOrder"
            onChange={handleSortOrderChange}
            options={["asc", "desc"]}
            placeholder="Select sort order"
          />
        </div>
      </div>
    </div>
  );
};
