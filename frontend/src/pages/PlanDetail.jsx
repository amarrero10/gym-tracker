import { useParams } from "react-router";

const PlanDetail = () => {
  const { id } = useParams();
  return <div className=" text-white">PlanDetail {id}</div>;
};

export default PlanDetail;
