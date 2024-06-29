import { useAppDispatch } from "app/hooks";
import { extractCustomId } from "core";
import { DataType } from "create/types";
import { deleteData } from "database/dbSlice";
import { omit } from "rambda";
import { Link } from "react-router-dom";
import { TrashIcon, RepoPullIcon } from "@primer/octicons-react";

const AIThead = () => {
  return (
    <thead>
      <tr>
        <th>AI名字</th>
        <th>AI所用模型</th>
        <th>AI 定制描述</th>
        <th>AI 回复规则</th>
        <th>AI 知识</th>
        <th>数据源</th>
        <th>操作</th>
      </tr>
    </thead>
  );
};

const PageThead = () => {
  return (
    <thead>
      <tr>
        <th>链接</th>
        <th>标题</th>

        <th>数据源</th>
        <th>操作</th>
      </tr>
    </thead>
  );
};
const Thead = () => {
  return (
    <thead>
      <tr>
        <th>Id</th>
        <th>数据类型</th>
        <th>数据源</th>
        <th>操作</th>
      </tr>
    </thead>
  );
};
const SurfHead = () => {
  return (
    <thead>
      <tr>
        <th>Id</th>
        <th>浪点名字</th>
        <th>数据源</th>
        <th>操作</th>
      </tr>
    </thead>
  );
};
export const DataTable = ({ dataList, type, pullData }) => {
  const dispatch = useAppDispatch();

  // const formatValue = omit(
  //   [
  //     "id",
  //     "name",
  //     "description",
  //     "model",
  //     "type",
  //     "path",
  //     "replyRule",
  //     "knowledge",
  //   ],
  //   data,
  // );
  const AITR = ({ data }) => {
    return (
      <tr>
        <td>{data.name}</td>
        <td>{data.model}</td>
        <td>{data.description}</td>
        <td>{data.replyRule}</td>
        <td>{data.knowledge}</td>
        <td>{data.source}</td>
        <td>
          <button
            onClick={() => {
              dispatch(deleteData({ id: data.id, source: data.source }));
            }}
          >
            删除
          </button>
        </td>
      </tr>
    );
  };

  const TR = ({ data }) => {
    return (
      <tr>
        <td className="w-full">
          <Link to={`/${data.id}`}>{extractCustomId(data.id)}</Link>
        </td>
        <td>{data.type}</td>

        <td>{data.source}</td>

        <td>
          <button
            onClick={() => {
              dispatch(deleteData({ id: data.id, source: data.source }));
            }}
          >
            <TrashIcon size={16} />
            删除
          </button>
          <button
            type="button"
            onClick={() => pullData(data.id, data)}
            className="rounded  p-2 "
          >
            <RepoPullIcon size={16} />
            拉取
          </button>
        </td>
      </tr>
    );
  };
  const SurfTR = ({ data }) => {
    return (
      <tr>
        <td className="w-full">
          <Link to={`/${data.id}`}>{extractCustomId(data.id)}</Link>
        </td>
        <td>{data.title}</td>

        <td>{data.source}</td>

        <td>
          <button
            onClick={() => {
              dispatch(deleteData({ id: data.id, source: data.source }));
            }}
          >
            <TrashIcon size={16} />
            删除
          </button>
          <button
            type="button"
            onClick={() => pullData(data.id, data)}
            className="rounded  p-2 "
          >
            <RepoPullIcon size={16} />
            拉取
          </button>
        </td>
      </tr>
    );
  };
  const PageTR = ({ data }) => {
    return (
      <tr>
        <td className="w-full">
          <Link to={`/${data.id}`}>{extractCustomId(data.id)}</Link>
        </td>

        <td>{data.source}</td>
        <td>{data.title}</td>

        <td>
          <button
            onClick={() => {
              dispatch(deleteData({ id: data.id, source: data.source }));
            }}
          >
            删除
          </button>
        </td>
      </tr>
    );
  };
  return (
    <div>
      {/* {dataList.map((data) => {
        return <div>{JSON.stringify(data)}</div>;
      })} */}
      <table>
        {type === DataType.ChatRobot && <AIThead />}
        {type === DataType.Page && <PageThead />}
        {type === DataType.SurfSpot && <SurfHead />}

        {!type && <Thead />}

        {/* <tfoot>
          <tr>
            <th>Table Footer 1</th>
            <th>Table Footer 2</th>
            <th>Table Footer 3</th>
            <th>Table Footer 4</th>
            <th>Table Footer 5</th>
          </tr>
        </tfoot> */}
        <tbody>
          {dataList.map((data) => (
            <>
              {type === DataType.ChatRobot && (
                <AITR data={data} key={data.id} />
              )}
              {type === DataType.Page && <PageTR data={data} key={data.id} />}
              {type === DataType.SurfSpot && (
                <SurfTR data={data} key={data.id} />
              )}
              {!type && <TR data={data} key={data.id} />}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
};
