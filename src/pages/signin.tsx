import { GetServerSideProps, type NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";

import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";

const Home: NextPage = () => {
  const router = useRouter();

  const { data: session, status } = useSession();
  if (session) {
    router.push("/tracker");
  }

  const { register, handleSubmit, reset } = useForm();

  const signin = async (d: any) => {
    if (!d.email || !d.password || d.password.length < 5) return;

    const status = await signIn("credentials", {
      redirect: false,
      email: d.email,
      password: d.password,
      callbackUrl: "/tracker",
    });

    if (status?.ok) status.url ? router.push(status.url) : "";
  };

  if (status == "loading") {
    return <div>Loading</div>;
  }

  return (
    <>
      <Head>
        <title>Tasktank Login</title>
      </Head>
      <div className="flex h-screen w-full items-center justify-center bg-dark/90">
        <div className="rounded-lg bg-white px-10 py-6 drop-shadow-md">
          <form
            onSubmit={handleSubmit(signin)}
            className="flex flex-col items-center text-dark"
          >
            <h1 className="w-fit text-xl font-bold">SignIn to Tasktank</h1>

            <p className="p-2"></p>

            <p className="text-center text-sm">
              Hey, Enter your details to get sign
              <br />
              in to your account
            </p>

            <p className="p-2"></p>

            <div className="relative grid w-full">
              <input
                {...register("email")}
                type="email"
                placeholder="Enter Email"
                className="w-full rounded border px-3 py-2 text-sm"
              ></input>
            </div>

            <p className="p-1"></p>

            <div className="relative grid w-full p-0 ">
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                className="w-full rounded border px-3 py-2 pr-9 text-sm"
                min={5}
              ></input>
            </div>

            <p className="p-1"></p>

            <button
              type="submit"
              className="w-full rounded-md bg-starynight/80 px-2 py-2 text-sm font-medium text-neutral hover:bg-starynight"
            >
              Login
            </button>

            <p className="p-2"></p>

            <p className="text-center text-sm font-light">
              Don&apos;t have an account?&nbsp;
              <span>
                <Link href={"/signup"}>
                  &nbsp;
                  <span className="text-starynight">Sign Up</span>&nbsp;
                </Link>
              </span>
            </p>
            <p className="p-1"></p>
            <p className="text-center text-sm font-light">Or Sign In with</p>

            <p className="p-2"></p>

            <div className="grid w-full grid-cols-2 gap-2">
              <button
                onClick={() => signIn("github", { callbackUrl: "/tracker" })}
                className="col-span-2 flex items-center justify-center rounded-md border px-3 py-2 transition-all hover:scale-105"
              >
                <svg
                  className="w-6 text-dark"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 496 512"
                >
                  <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
                </svg>
                <p className="p-1"></p>
                <span className="font-light">Github</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Home;
