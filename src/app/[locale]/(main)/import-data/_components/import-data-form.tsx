"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { getCookie } from "cookies-next";
import { Import, Loader, Upload } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "@/navigation";
import Dropzone, { DropzoneState } from "@/components/ui/dropzone";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getImportDataSchema } from "@/lib/schemas";
import request from "@/lib/request";

const ImportDataForm = () => {
  const t = useTranslations("ImportData");

  const router = useRouter();

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const st = useTranslations("Schemas.importDataSchema");
  const formSchema = getImportDataSchema(st);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      importType: "products",
    },
  });

  const errors = form.formState.errors;

  const file = useWatch({ control: form.control, name: "file" });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("importType", values.importType);
    formData.append("file", values.file);

    const config = {
      method: "post",
      headers: {
        "Accept-Language": getCookie("NEXT_LOCALE"),
      },
      body: formData,
    };

    try {
      form.reset();

      await request("/api/import-data", config);

      router.refresh();
    } catch (error) {
      let message = "";
      if (error instanceof Error) message = error.message;
      else message = String(error);
      toast({
        title: t("error"),
        description: message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="importType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("importType")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="products">
                      {t("productsImport")}
                    </SelectItem>
                    <SelectItem value="prices">
                      {t("productPricesImport")}
                    </SelectItem>
                    <SelectItem value="balance">
                      {t("productBalanceImport")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-sm text-muted-foreground">{t("templateHint")}</p>
          <Dropzone
            onDrop={(acceptedFiles: File[]) => {
              if (acceptedFiles.length > 0)
                form.setValue("file", acceptedFiles[0]);
            }}
            multiple={false}
            accept={{
              "application/vnd.ms-excel": [],
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [],
              "text/csv": [],
            }}
          >
            {(dropzone: DropzoneState) => (
              <div className="flex items-center flex-col gap-1.5">
                {file ? (
                  <div className="">
                    <span>{file.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center flex-row gap-0.5 text-sm font-medium">
                    <Upload className="mr-2 h-4 w-4" />
                    <span>{t("uploadFile")}</span>
                  </div>
                )}
              </div>
            )}
          </Dropzone>
          {errors.file && <FormMessage>{errors.file.message}</FormMessage>}
          <div className="flex justify-center items-center w-full space-x-4">
            <Button disabled={!file || loading}>
              {loading ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  <Import className="mr-2 h-4 w-4" />
                  <span>{t("import")}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ImportDataForm;