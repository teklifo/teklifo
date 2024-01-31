import fs from "fs";
import path from "path";
import xml2js from "xml2js";
import cloudinary from "@/lib/cloudinary";
import { Prisma } from "@prisma/client";
import { checkFile } from "@/lib/utils";
import { CommerceML_Import } from "@/types";
import db from "@/lib/db";

type ProductType = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

const readCMLFiles = async (companyId: string, folderPath: string) => {
  try {
    // Check that folder with message files truly exists
    const folderExists = await checkFile(folderPath);
    if (!folderExists) {
      return;
    }

    // Find import files
    const exchangeFiles = await fs.promises.readdir(folderPath);
    const importFiles = exchangeFiles.filter(
      (e) => e.startsWith("import") && path.extname(e) === ".xml"
    );

    if (importFiles.length > 0) {
      await Promise.all(
        importFiles.map(async (importFile) => {
          // For each 'import' file there can be an 'offers' file
          const offersFile = exchangeFiles.find((e) => {
            return e === importFile.replace("import", "offers");
          });

          // Create a 'progress' folder.
          const progressPath = `${folderPath}/progress`;
          const inProgress = await checkFile(progressPath);
          if (!inProgress) {
            await fs.promises.mkdir(progressPath);
          }

          // Read import.xml
          const importXml = await fs.promises.readFile(
            `${folderPath}/${importFile}`,
            "utf8"
          );
          await readImportFile(companyId, importXml, folderPath);

          // Read offers.xml
          if (offersFile) {
            const offersXml = await fs.promises.readFile(
              `${folderPath}/${offersFile}`,
              "utf8"
            );
            await readOffersFile(offersXml);
          }
        })
      );
    }

    await fs.promises.rm(folderPath, { recursive: true, force: true });
  } catch (error) {
    const folderExists = await checkFile(folderPath);
    if (folderExists) {
      await fs.promises.rm(folderPath, { recursive: true, force: true });
    }
    throw error;
  }
};

const readImportFile = async (
  companyId: string,
  importXml: string,
  folderPath: string
) => {
  // Retrieve data from plain xml
  const parser = new xml2js.Parser();
  const importData = (await parser.parseStringPromise(
    importXml
  )) as CommerceML_Import;

  // Map through catalogs
  const catalogs = importData.КоммерческаяИнформация.Каталог;
  const onlyChanges =
    catalogs.length > 0
      ? catalogs[0].СодержитТолькоИзменения
        ? catalogs[0].СодержитТолькоИзменения[0] === "true"
        : catalogs[0].$?.СодержитТолькоИзменения === "true"
      : true;

  catalogs.forEach((catalog) => {
    const products = catalog.Товары.length > 0 ? catalog.Товары[0].Товар : null;
    if (!products) return;

    products.forEach(async (productData) => {
      try {
        // Read productId and characteristicId if provided
        const externalId = productData.Ид[0];
        const ids = externalId.split("#");
        const productId = ids[0];
        const characteristicId = ids.length > 1 ? ids[1] : "";

        // Read images path
        const images: string[] = [];
        if (productData.Картинка && productData.Картинка.length > 0) {
          productData.Картинка.map((e) => {
            images.push(e);
          });
        }

        // Extract other properties
        const name =
          productData.Наименование.length > 0
            ? productData.Наименование[0]
            : "";
        const number =
          productData.Артикул.length > 0 ? productData.Артикул[0] : "";
        const description = productData.Описание ? productData.Описание[0] : "";
        const brand = productData.Изготовитель
          ? productData.Изготовитель.Наименование[0]
          : "";
        const unit =
          productData.БазоваяЕдиница.length > 0
            ? productData.БазоваяЕдиница[0].$.НаименованиеПолное
            : "";

        // Find product by externalId or number
        const existingProduct = await db.product.findFirst({
          where: {
            AND: [
              {
                OR: [
                  {
                    externalId,
                  },
                  {
                    number,
                  },
                ],
              },
              {
                companyId,
              },
            ],
          },
        });

        // Upsert product
        const product = await db.product.upsert({
          where: {
            id: existingProduct?.id ?? 0,
          },
          create: {
            companyId,
            externalId,
            productId,
            characteristicId,
            name,
            number,
            brand,
            brandNumber: "",
            unit,
            description,
            archive: false,
          },
          update: {
            companyId,
            externalId,
            productId,
            characteristicId,
            name,
            number,
            brand,
            brandNumber: "",
            unit,
            description,
            archive: false,
          },
          include: {
            images: true,
          },
        });

        // Upsert product images
        await upsertImages(product, images, folderPath, onlyChanges);
      } catch (error) {
        console.log(error);
        throw error;
      }
    });
  });
};

const upsertImages = async (
  product: ProductType,
  images: string[],
  folderPath: string,
  onlyChanges: boolean
) => {
  // Images will be uploaded in two cases:
  // 1. Product didn't have an commerceMl image before
  // 2. This exchange file contains only changes
  // Also characteristicId must be empty

  const existingCommerceMlImages = product.images.filter(
    (i) => i.commerceMl === true
  );

  if (
    !images ||
    (existingCommerceMlImages.length > 0 && !onlyChanges) ||
    product.characteristicId
  ) {
    return;
  }

  try {
    // Delete old images
    await Promise.all(
      existingCommerceMlImages.map(async (i) => {
        await cloudinary.uploader.destroy(i.id);
      })
    );

    // Upload new images
    const results = await Promise.all(
      images.map(async (image) => {
        const path = `${folderPath}/${image}`;
        try {
          return await cloudinary.uploader.upload(path);
        } catch (error) {
          return {
            public_id: "",
            secure_url: "",
          };
        }
      })
    );

    const data = results
      .filter((e) => e.public_id !== "")
      .map((result) => {
        return {
          id: result.public_id,
          url: result.secure_url,
          commerceMl: true,
          productId: product.id,
        };
      });

    // Update product images
    await db.productImage.createMany({
      data,
    });
  } catch (error) {
    console.log(error);
  }
};

const readOffersFile = async (offersXml: string) => {};

export default readCMLFiles;
