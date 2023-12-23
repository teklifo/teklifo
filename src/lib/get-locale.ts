const getLocale = (headers: Headers) => {
  const acceptedLanguagues = ["az", "ru"];

  const locale = headers.get("Accept-Language") ?? "az";

  if (!acceptedLanguagues.includes(locale)) {
    return "az";
  }
  return locale;
};

export default getLocale;
