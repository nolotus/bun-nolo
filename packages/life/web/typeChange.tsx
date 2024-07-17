import { DataType } from "create/types";
import { useAppSelector } from "app/hooks";
import { selectFilterType } from "../selectors";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

const typeArray = ["All", ...Object.values(DataType)];

export const TypeChange = () => {
  const filterType = useAppSelector(selectFilterType);
  let [searchParams, setSearchParams] = useSearchParams();

  //style
  const mainColor = useSelector((state: any) => state.theme.mainColor);

  const changeType = (type) => {
    if (type === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ filterType: type });
    }
  };
  return (
    <div className="flex gap-2">
      {typeArray.map((typeItem) => {
        const isActive =
          filterType === typeItem || (typeItem === "All" && !filterType);
        return (
          <div
            key={typeItem}
            onClick={() => changeType(typeItem)}
            className="relative flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:bg-blue-100"
            style={
              isActive
                ? { borderBottom: "3px solid", borderBottomColor: mainColor }
                : undefined
            }
          >
            {typeItem}
          </div>
        );
      })}
    </div>
  );
};
