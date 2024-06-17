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

  // Product
  await db.product.createMany({
    data: [
      {
        id: 1,
        externalId: "4d596b25-0517-4250-a969-f51c2381cc6f",
        productId: null,
        characteristicId: null,
        name: "Thinkpad",
        number: "54321",
        brand: "Lenovo",
        brandNumber: "85241",
        unit: "piece",
        description: "2024, 64 RAM, i11",
        archive: false,
        companyId: "lorem",
        createdAt: "2024-06-16T13:22:58.291Z",
        updatedAt: "2024-06-16T13:22:58.291Z",
        deleted: false,
      },
      {
        id: 2,
        externalId: "4d596b25-0517-4250-a969-f51c2381cc6c",
        productId: null,
        characteristicId: null,
        name: "Macbook Air",
        number: "54321",
        brand: "Apple",
        brandNumber: "951478",
        unit: "piece",
        description: "2024, 32 RAM, M1",
        archive: false,
        companyId: "lorem",
        createdAt: "2024-06-16T13:22:58.291Z",
        updatedAt: "2024-06-16T13:22:58.291Z",
        deleted: false,
      },
    ],
  });

  // Request for quotation
  await db.requestForQuotation.createMany({
    data: [
      {
        versionId: "clxhm1xi9000hg6bzwl5dolza",
        id: "clxhluv3w0003g6bz8vu8rb0m",
        externalId: null,
        number: 1,
        companyId: "lorem",
        privateRequest: true,
        userId: "clxc7jt700000qwprocvs6aue",
        title: "Purchase of computer equipment",
        currency: "USD",
        startDate: "2024-06-29T20:00:00.000Z",
        endDate: "2024-07-30T20:00:00.000Z",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras vel massa vestibulum eros tempus tincidunt non et ante. Aliquam et dictum urna. Mauris auctor pretium ullamcorper. Aenean volutpat aliquet mauris, tempor lacinia nibh malesuada vel. Sed fermentum, nulla sed semper aliquam, ipsum purus congue nunc, eget venenatis tellus neque eget ex. Nunc non efficitur dui. Cras enim mauris, tempor id justo id, consequat sollicitudin augue. Nullam nec euismod erat, id sodales nibh. Morbi vestibulum imperdiet urna et laoreet.",
        deliveryAddress: "Main st. 200",
        deliveryTerms:
          "Cras id mi nibh. Duis at gravida sapien. Maecenas ac risus vitae ex maximus lacinia. Ut ac quam justo. Maecenas vestibulum dolor quis mi auctor, nec aliquam augue malesuada. Duis viverra, massa id lacinia suscipit, tellus erat suscipit felis, eu pretium orci elit ut metus. In commodo velit vel ipsum dictum scelerisque.",
        paymentTerms:
          "Sed at tincidunt urna. Sed fringilla tortor at nunc finibus, id congue lacus pharetra. Curabitur odio massa, facilisis ut dui ut, tristique pellentesque diam. Nunc ut imperdiet elit.",
        createdAt: "2024-06-16T13:57:09.729Z",
        latestVersion: true,
        deleted: false,
      },
    ],
  });

  // Request for quotation item
  await db.requestForQuotationItem.createMany({
    data: [
      {
        versionId: "clxhm1xih000ig6bz2nkom59w",
        id: "clxhluv3w000bg6bzb4hdcjer",
        externalId: null,
        requestForQuotationId: "clxhm1xi9000hg6bzwl5dolza",
        lineNumber: 0,
        productName: "Lenovo PC 1T 8RAM i7",
        productId: null,
        comment:
          "Sed a augue vitae leo tempus tempor et eu libero. Donec nec sagittis turpis. Nullam egestas ornare nisi. Fusce mollis scelerisque porttitor",
        quantity: "6",
        price: "800",
        deliveryDate: "2024-08-09T20:00:00.000Z",
      },
      {
        versionId: "clxhm1xih000jg6bzylrx6v85",
        id: "clxhluv3w000dg6bzo0g5f8q8",
        externalId: null,
        requestForQuotationId: "clxhm1xi9000hg6bzwl5dolza",
        lineNumber: 1,
        productName: "Apple MacBook Pro M1 16RAM",
        productId: null,
        comment: "",
        quantity: "2",
        price: "4000",
        deliveryDate: "2024-07-31T20:00:00.000Z",
      },
      {
        versionId: "clxhm1xih000kg6bzrq1va2ek",
        id: "clxhluv3w000fg6bznx99yq8t",
        externalId: null,
        requestForQuotationId: "clxhm1xi9000hg6bzwl5dolza",
        lineNumber: 2,
        productName: "Thinkpad",
        productId: 1,
        comment: "",
        quantity: "1",
        price: "1100",
        deliveryDate: "2024-08-09T20:00:00.000Z",
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
