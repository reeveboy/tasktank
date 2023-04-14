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
import { Session } from "next-auth";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import classNames from "classnames";

interface props {
  children?: React.ReactNode;
  session: Session;
  route: string;
}

const Layout: React.FC<props> = ({ children, session, route }) => {
  const { user } = session;

  const router = useRouter();

  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col items-center border-r border-carbon bg-dark p-2">
        <div className="grid h-[50px] place-items-center p-2">
          <FontAwesomeIcon icon={faRocket} className="text-3xl text-sky-blue" />
        </div>
        <div className="flex w-full grow flex-col">
          {/* <Link href={"/dashboard"}>
            <FontAwesomeIcon
              icon={faClock}
              className={classNames(
                "mb-4 text-xl transition-all hover:scale-110 hover:text-sky-300",
                router.pathname == "/dashboard"
                  ? "text-sky-400"
                  : "text-sky-200"
              )}
            />
          </Link>
          <Link href={"/projects"}>
            <FontAwesomeIcon
              icon={faBook}
              className={classNames(
                "mb-4 text-xl transition-all hover:scale-110 hover:text-sky-300",
                router.pathname == "/projects" ? "text-sky-400" : "text-sky-200"
              )}
            />
          </Link>
          <Link href={"/teams"}>
            <FontAwesomeIcon
              icon={faPeopleGroup}
              className={classNames(
                "mb-4 text-xl transition-all hover:scale-110 hover:text-sky-300",
                router.pathname == "/teams" ? "text-sky-400" : "text-sky-200"
              )}
            />
          </Link>
          <Link href={"/reports"}>
            <FontAwesomeIcon
              icon={faChartPie}
              className={classNames(
                "mb-4 text-xl transition-all hover:scale-110 hover:text-sky-300",
                router.pathname == "/reports" ? "text-sky-400" : "text-sky-200"
              )}
            />
          </Link> */}
          <Link href={"/dashboard"}>
            <button
              className={classNames(
                "flex w-full items-end justify-between rounded px-3 py-2 text-sm font-medium text-white",
                router.pathname == "/dashboard"
                  ? "bg-starynight/80"
                  : "bg-white/10"
              )}
            >
              <span>Tracker</span>
              <p className="p-1"></p>
              <FontAwesomeIcon
                className="text-lg text-neutral"
                icon={faClock}
              />
            </button>
          </Link>
          <p className="p-2"></p>
          <Link href={"/projects"}>
            <button
              className={classNames(
                "flex w-full items-end justify-between  rounded px-3 py-2 text-xs font-medium text-white",
                router.pathname == "/projects"
                  ? "bg-starynight/80"
                  : "bg-white/10"
              )}
            >
              <span>Projects</span>
              <p className="p-1"></p>
              <FontAwesomeIcon className="text-lg text-neutral" icon={faBook} />
            </button>
          </Link>
          <p className="p-2"></p>
          <Link href={"/teams"}>
            <button
              className={classNames(
                "flex w-full items-end justify-between rounded px-3 py-2 text-xs font-medium text-white",
                router.pathname == "/teams" ? "bg-starynight/80" : "bg-white/10"
              )}
            >
              <span>Teams</span>
              <p className="p-1"></p>
              <FontAwesomeIcon
                className="text-lg text-neutral"
                icon={faPeopleGroup}
              />
            </button>
          </Link>
          <p className="p-2"></p>
          <Link href={"/reports"}>
            <button
              className={classNames(
                "flex w-full items-end justify-between rounded px-3 py-2 text-xs font-medium text-white",
                router.pathname == "/reports"
                  ? "bg-starynight/80"
                  : "bg-white/10"
              )}
            >
              <span>Reports</span>
              <p className="p-1"></p>
              <FontAwesomeIcon
                className="text-lg text-neutral"
                icon={faChartPie}
              />
            </button>
          </Link>
        </div>
        <div>
          {/* <button onClick={() => signOut()}>
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="text-xl  text-sky-200 transition-all hover:scale-110 hover:text-sky-300"
            />
          </button> */}
          <button
            onClick={() => signOut()}
            className="flex w-full items-end justify-between rounded bg-white/10 px-3 py-2 text-xs font-medium text-white"
          >
            <span>Logout</span>
            <p className="p-1"></p>
            <FontAwesomeIcon
              className="text-lg text-neutral"
              icon={faRightFromBracket}
            />
          </button>
        </div>
      </div>
      <div className="flex w-full flex-col">
        <div className="flex h-[55px] w-full items-center bg-starynight/80 p-2 ">
          <div className="text-lg font-bold text-neutral">{route}</div>
          {/* <div className="flex h-full grow items-center justify-center">
            <Link href={"/dashboard"}>
              <button
                className={classNames(
                  "rounded px-3 py-2 text-xs font-medium text-white",
                  router.pathname == "/dashboard"
                    ? "bg-starynight/80"
                    : "bg-white/10"
                )}
              >
                Tracker
              </button>
            </Link>
            <p className="p-2"></p>
            <Link href={"/projects"}>
              <button
                className={classNames(
                  "rounded px-3 py-2 text-xs font-medium text-white",
                  router.pathname == "/projects"
                    ? "bg-starynight/80"
                    : "bg-white/10"
                )}
              >
                Projects
              </button>
            </Link>
            <p className="p-2"></p>
            <Link href={"/teams"}>
              <button
                className={classNames(
                  "rounded px-3 py-2 text-xs font-medium text-white",
                  router.pathname == "/teams"
                    ? "bg-starynight/80"
                    : "bg-white/10"
                )}
              >
                Teams
              </button>
            </Link>
            <p className="p-2"></p>
            <Link href={"/reports"}>
              <button
                className={classNames(
                  "rounded px-3 py-2 text-xs font-medium text-white",
                  router.pathname == "/reports"
                    ? "bg-starynight/80"
                    : "bg-white/10"
                )}
              >
                Reports
              </button>
            </Link>
          </div> */}
          <img
            className="ml-auto h-10 w-10 cursor-pointer rounded-full border-2 border-dark transition-all hover:scale-[1.01]"
            src={user.image ? user.image : ""}
          />
        </div>
        <div className="grow overflow-y-auto bg-neutral">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
