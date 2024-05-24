import React, { useState, useEffect } from "react";
import { Select } from "ui";
import { OrganizationIcon } from "@primer/octicons-react";
import { useProfileData } from "../useProfileData";
const ExtendedProfile = () => {
  const customId = "extendedProfile";
  const { formData, setFormData, handleSaveClick, error } =
    useProfileData(customId);

  const provinces = ["北京", "上海", "广东"];
  const cities = {
    北京: ["北京市"],
    上海: ["上海市"],
    广东: ["广州市", "深圳市"],
  };

  const [currentProvince, setCurrentProvince] = useState("");
  const [nextProvince, setNextProvince] = useState("");
  const [journeyPoints, setJourneyPoints] = useState([]);
  const fetchJourneyPointsAPI = () => {
    return Promise.resolve([
      "旅居点1",
      "旅居点2",
      "旅居点3",
      // ...更多旅居点
    ]);
  };
  useEffect(() => {
    fetchJourneyPointsAPI().then((data) => setJourneyPoints(data));
  }, []);

  return (
    <div className="space-y-4 p-4">
      <h2 className="mb-2">ExtendedProfile</h2>
      <div className="space-y-2">
        <h2>兴趣爱好</h2>
        <input
          type="text"
          placeholder="已经会的兴趣 (comma separated)"
          value={
            formData?.knownInterests ? formData.knownInterests.join(", ") : ""
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              knownInterests: e.target.value
                .split(", ")
                .map((str) => str.trim()),
            })
          }
          className="w-full "
        />
        <input
          type="text"
          placeholder="感兴趣的 (comma separated)"
          value={
            formData?.interestedIn ? formData?.interestedIn.join(", ") : ""
          }
          onChange={(e) =>
            setFormData({
              ...formData,
              interestedIn: e.target.value.split(", ").map((str) => str.trim()),
            })
          }
          className="w-full"
        />
      </div>

      <div className="space-y-6  py-3">
        <h2>居住</h2>
        <div className="space-y-2">
          <h4>将去</h4>
          <Select
            options={provinces}
            value={currentProvince}
            onChange={(e) => {
              setCurrentProvince(e.target.value);
              setFormData({ ...formData, currentProvince: e.target.value });
            }}
            placeholder="选择省份"
          />
          <Select
            options={cities[currentProvince] || []}
            value={formData?.currentCity || ""}
            onChange={(e) =>
              setFormData({ ...formData, currentCity: e.target.value })
            }
            placeholder="选择城市"
          />
          <div className="flex items-center">
            <OrganizationIcon size={24} className="mr-2" />
            <Select
              options={journeyPoints}
              value={formData?.currentJourneyPoint || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentJourneyPoint: e.target.value,
                })
              }
              placeholder="请选择旅居点"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h4>将去</h4>

          <Select
            options={provinces}
            value={nextProvince}
            onChange={(e) => {
              setNextProvince(e.target.value);
              setFormData({ ...formData, nextProvince: e.target.value });
            }}
            placeholder="选择省份"
          />
          <Select
            options={cities[nextProvince] || []}
            value={formData?.nextCity || ""}
            onChange={(e) =>
              setFormData({ ...formData, nextCity: e.target.value })
            }
            placeholder="选择城市"
          />

          <Select
            options={journeyPoints}
            value={formData?.nextJourneyPoint || ""}
            onChange={(e) =>
              setFormData({ ...formData, nextJourneyPoint: e.target.value })
            }
            placeholder="请选择旅居点"
          />
        </div>
      </div>
      <button onClick={handleSaveClick} className=" w-full  ">
        Save
      </button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default ExtendedProfile;
