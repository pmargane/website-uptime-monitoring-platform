import type { MonitorActiveState } from "../generated/prisma/enums";
import prisma from "../index";

interface UserCreateInput {
  email: string;
  password: string;
}

const DEMO_USERS: UserCreateInput[] = [
  {
    email: "john.doe@example.com",
    password: "password",
  },
  {
    email: "jane.doe@example.com",
    password: "password",
  },
];

const DEMO_MONITORS = [
  {
    url: "https://google.com",
    name: "Google",
    isActive: "ACTIVE",
  },
  {
    url: "https://facebook.com",
    name: "Facebook",
    isActive: "ACTIVE",
  },
  {
    url: "https://github.com",
    name: "Github",
    isActive: "ACTIVE",
  },
  {
    url: "https://youtube.com",
    name: "Youtube",
    isActive: "ACTIVE",
  },
  {
    url: "https://websitethatdoesnotexist.com",
    name: "Website that does not exist",
    isActive: "ACTIVE",
  },
];

async function seedDB() {
  try {
    await prisma.tick.deleteMany();
    await prisma.monitor.deleteMany();
    await prisma.user.deleteMany();

    const [user1, user2] = await Promise.all([
      prisma.user.create({
        data: {
          email: DEMO_USERS[0]?.email as string,
          password: DEMO_USERS[0]?.password as string,
        },
      }),
      prisma.user.create({
        data: {
          email: DEMO_USERS[1]?.email as string,
          password: DEMO_USERS[1]?.password as string,
        },
      }),
    ]);
    await prisma.monitor.createMany({
      data: DEMO_MONITORS.map((monitor) => ({
        ...monitor,
        isActive: monitor.isActive as MonitorActiveState,
        userId: Math.random() > 0.5 ? user1.id : user2.id,
      })),
    });

    console.log("Database seeded successfully");
  } catch (error) {
    console.log(error);
  }
}

seedDB();
