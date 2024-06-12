import db from "@/lib/db";

async function main() {
  // Account
  await db.account.createMany({
    data: [],
  });

  // Company
  await db.company.createMany({
    data: [
      {
        id: "lorem",
        name: "Lorem LLC",
        tin: "0123456789",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Etiam tempor orci eu lobortis elementum nibh. Nec sagittis aliquam malesuada bibendum arcu. Ut venenatis tellus in metus vulputate eu scelerisque. Nunc vel risus commodo viverra. Tincidunt id aliquet risus feugiat. Vulputate ut pharetra sit amet aliquam id diam maecenas. Vitae tortor condimentum lacinia quis vel eros donec ac. Vestibulum mattis ullamcorper velit sed. Imperdiet dui accumsan sit amet nulla facilisi morbi. Semper eget duis at tellus at urna condimentum mattis pellentesque. Sagittis id consectetur purus ut faucibus pulvinar. Id ornare arcu odio ut. Tortor posuere ac ut consequat semper viverra nam. Erat velit scelerisque in dictum. Risus quis varius quam quisque id diam.",
        descriptionRu: "",
        slogan: "We do the best we can",
        sloganRu: "",
        createdAt: "2024-06-12T19:29:37.545Z",
        updatedAt: "2024-06-12T19:29:37.545Z",
        deleted: false,
      },
      {
        id: "kraft",
        name: "Kraft LLC",
        tin: "9876543210",
        description:
          "Nisi lacus sed viverra tellus in hac habitasse. Morbi tincidunt ornare massa eget egestas purus viverra accumsan. Eros in cursus turpis massa tincidunt dui ut ornare lectus. Nam at lectus urna duis convallis convallis tellus id. Eu non diam phasellus vestibulum. Netus et malesuada fames ac turpis egestas. Fermentum leo vel orci porta. Nulla at volutpat diam ut. Sit amet cursus sit amet dictum sit amet justo donec. Neque convallis a cras semper auctor neque. Mauris nunc congue nisi vitae. Risus feugiat in ante metus dictum at tempor commodo.",
        descriptionRu: "",
        slogan: "Obey and consume",
        sloganRu: "",
        createdAt: "2024-06-12T19:30:58.606Z",
        updatedAt: "2024-06-12T19:30:58.606Z",
        deleted: false,
      },
    ],
  });

  // User
  await db.user.createMany({
    data: [
      {
        id: "clxc7jt700000qwprocvs6aue",
        name: null,
        email: "kamranv21@gmail.com",
        emailVerified: "2024-06-12T19:12:18.825Z",
        password:
          "$2b$10$M84nOXidlvFgAhsmJWqnxOH1z/bSjStXLkpzhykVBFAWllkkvwmHy",
        image: null,
        role: "USER",
        createdAt: "2024-06-12T19:12:18.828Z",
        updatedAt: "2024-06-12T19:12:56.943Z",
        deleted: false,
      },
    ],
  });

  // Company role
  await db.companyRole.createMany({
    data: [
      {
        id: "clxc862og0002qwpr1ni870k7",
        name: "Full access",
        default: true,
        companyId: "lorem",
      },
      {
        id: "clxc87t8c0004qwprpf5xb3fy",
        name: "Full access",
        default: true,
        companyId: "kraft",
      },
    ],
  });

  // Company members
  await db.companyMembers.createMany({
    data: [
      {
        userId: "clxc7jt700000qwprocvs6aue",
        companyId: "lorem",
        companyRoleId: "clxc862og0002qwpr1ni870k7",
      },
      {
        userId: "clxc7jt700000qwprocvs6aue",
        companyId: "kraft",
        companyRoleId: "clxc87t8c0004qwprpf5xb3fy",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
