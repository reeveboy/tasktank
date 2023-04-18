import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faChartPie,
  faClock,
  faPeopleGroup,
  faRightFromBracket,
  faRocket,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import classNames from "classnames";
import Dropdown from "./Dropdown";

interface props {
  children?: React.ReactNode;
}

const Layout: React.FC<props> = ({ children }) => {
  const router = useRouter();
  const { data, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin");
    },
  });

  const user = data?.user;

  if (!data) {
    return null;
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex w-full max-w-[150px] flex-col items-center bg-dark p-2">
        <div className="grid h-[50px] place-items-center p-2">
          <FontAwesomeIcon icon={faRocket} className="text-3xl text-sky-blue" />
        </div>
        <p className="p-2"></p>
        <div className="flex w-full grow flex-col">
          <Link href={"/tracker"}>
            <button
              className={classNames(
                "flex w-full items-end justify-between rounded px-3 py-2 text-sm font-medium text-sky-blue transition-all hover:scale-[1.05] hover:bg-white/20",
                router.pathname == "/tracker"
                  ? "bg-starynight/80"
                  : "bg-white/10"
              )}
            >
              <span>Tracker</span>
              <p className="p-1"></p>
              <FontAwesomeIcon
                className="text-lg text-sky-blue"
                icon={faClock}
              />
            </button>
          </Link>
          <p className="p-2"></p>
          <Link href={"/projects"}>
            <button
              className={classNames(
                "flex w-full items-end justify-between rounded px-3 py-2 text-sm font-medium text-sky-blue transition-all hover:scale-[1.05] hover:bg-white/20",
                router.pathname == "/projects"
                  ? "bg-starynight/80"
                  : "bg-white/10"
              )}
            >
              <span>Projects</span>
              <p className="p-1"></p>
              <FontAwesomeIcon
                className="text-lg text-sky-blue"
                icon={faBook}
              />
            </button>
          </Link>
          <p className="p-2"></p>
          <Link href={"/teams"}>
            <button
              className={classNames(
                "flex w-full items-end justify-between rounded px-3 py-2 text-sm font-medium text-sky-blue transition-all hover:scale-[1.05] hover:bg-white/20",
                router.pathname == "/teams" ? "bg-starynight/80" : "bg-white/10"
              )}
            >
              <span>Teams</span>
              <p className="p-1"></p>
              <FontAwesomeIcon
                className="text-lg text-sky-blue"
                icon={faPeopleGroup}
              />
            </button>
          </Link>
          <p className="p-2"></p>
          <Link href={"/reports"}>
            <button
              className={classNames(
                "flex w-full items-end justify-between rounded px-3 py-2 text-sm font-medium text-sky-blue transition-all hover:scale-[1.05] hover:bg-white/20",
                router.pathname == "/reports"
                  ? "bg-starynight/80"
                  : "bg-white/10"
              )}
            >
              <span>Reports</span>
              <p className="p-1"></p>
              <FontAwesomeIcon
                className="text-lg text-sky-blue"
                icon={faChartPie}
              />
            </button>
          </Link>
        </div>
        <div className="w-full">
          <button
            onClick={() => signOut()}
            className="flex w-full items-end justify-between rounded bg-white/10 px-3 py-2 text-sm font-medium text-sky-blue transition-all hover:scale-[1.05] hover:bg-white/20"
          >
            <span>Logout</span>
            <p className="p-1"></p>
            <FontAwesomeIcon
              className="text-lg text-sky-blue"
              icon={faRightFromBracket}
            />
          </button>
        </div>
      </div>
      <div className="flex w-full flex-col">
        <div className="flex h-[55px] w-full items-center bg-starynight/80 p-2 ">
          <div className="text-lg text-neutral">
            <span>Welcome, </span>
            <span className="font-medium ">{user?.name?.split(" ")[0]}</span>
          </div>
          <Dropdown user={user}>
            <img
              className="ml-auto h-8 cursor-pointer rounded-full border-2 border-dark transition-all hover:scale-[1.01]"
              src={user?.image ? user.image : ""}
            />
          </Dropdown>
        </div>
        <div className="grow overflow-y-auto bg-neutral">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
