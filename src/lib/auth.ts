import { GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function getSession(context: GetServerSidePropsContext) {
  return await getServerSession(context.req, context.res, authOptions);
}

export async function requireAuth(
  context: GetServerSidePropsContext,
  requiredRole?: string
) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  if (requiredRole && session.user.role !== requiredRole && session.user.role !== "SUPER_ADMIN") {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      },
    };
  }

  return { props: { session } };
}