SELECT
  ri.id,
  q.id quotationId,
  qi."skip",
  qi."amountWithVat",
  qi."deliveryDate",
  q."createdAt"
FROM
  "RequestForQuotationItem" ri
  INNER JOIN "RequestForQuotation" r ON r."versionId" = ri."requestForQuotationId" AND r."latestVersion"
  LEFT JOIN "QuotationItem" qi ON ri."versionId" = qi."rfqItemVersionId"
  LEFT JOIN "Quotation" q ON q.id = qi."quotationId"
WHERE
  r.id = $1
ORDER BY
 qi."skip" asc,
 qi."amountWithVat" asc,
 qi."deliveryDate" asc,
 q."createdAt"
 