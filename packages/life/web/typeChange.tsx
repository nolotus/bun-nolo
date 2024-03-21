import { DataType } from "create/types";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectFilterType } from "../selectors";
import { setFilterType } from "../lifeSlice";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

const typeArray = ["All", ...Object.values(DataType)];

export const TypeChange = () => {
  const filterType = useAppSelector(selectFilterType);
  const dispatch = useAppDispatch();
  let [searchParams, setSearchParams] = useSearchParams();

  //style
  const mainColor = useSelector((state: any) => state.theme.mainColor);

  const handleFilterTypeChange = (type) => {};
  const changeType = (type) => {
    if (type === "All") {
      console.log("type", type);
      dispatch(setFilterType());
      setSearchParams({});
    } else {
      dispatch(setFilterType(type));
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
