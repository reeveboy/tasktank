import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faChartPie,
  faClock,
  faPeopleGroup,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { Session } from "next-auth";

interface props {
  children?: React.ReactNode;
  session: Session;
  route: string;
}

const Layout: React.FC<props> = ({ children, session, route }) => {
  const { user } = session;

  return (
    <div className="flex h-screen w-full">
      <div className="flex w-[60px] flex-col items-center border-r border-carbon bg-dark">
        <div className="grid h-[50px] place-items-center p-2">
          <FontAwesomeIcon icon={faRocket} className="text-3xl text-sky-blue" />
        </div>
        <div className="flex flex-col items-center p-2">
          <FontAwesomeIcon
            icon={faClock}
            className="mb-4 text-2xl text-sky-blue"
          />
          <FontAwesomeIcon
            icon={faBook}
            className="mb-4 text-2xl text-sky-blue"
          />
          <FontAwesomeIcon
            icon={faChartPie}
            className="mb-4 text-2xl text-sky-blue"
          />
          <FontAwesomeIcon
            icon={faPeopleGroup}
            className="mb-4 text-2xl text-sky-blue"
          />
        </div>
      </div>
      <div className="flex w-full flex-col">
        <div className="flex h-[50px] w-full items-center bg-dark p-2 ">
          <div className="grow text-lg font-bold text-neutral">{route}</div>
          <img
            className="h-8 w-8 rounded-full"
            src={user.image ? user.image : ""}
          />
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Layout;
