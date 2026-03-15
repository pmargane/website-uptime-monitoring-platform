import type { MonitorActiveState } from "../generated/prisma/enums";
import prisma from "../index";
import bcrypt from 'bcryptjs'

interface UserCreateInput {
  email: string;
  password: string;
}

const DEMO_USER: UserCreateInput =
{
  email: "bridentony45@gmail.com",
  password: "test1234",
};

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
    isActive: "PAUSED",
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

    const user = await prisma.user.create({
      data: {
        email: DEMO_USER.email,
        password: await bcrypt.hash(DEMO_USER.password, 10),
      }
    });

    await prisma.monitor.createMany({
      data: DEMO_MONITORS.map((monitor) => ({
        ...monitor,
        isActive: monitor.isActive as MonitorActiveState,
        userId: user.id
      }))
    })

  } catch (error) {
    console.log(error);
  }
}

seedDB().then(() => {
  console.log("Database seeded successfully");
}).catch(console.error);
