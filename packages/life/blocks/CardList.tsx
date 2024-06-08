export const CardList = ({ dataList }) => {
  return (
    <div>
      {dataList.map((data) => {
        return <div>{JSON.stringify(data)}</div>;
      })}
    </div>
  );
};
