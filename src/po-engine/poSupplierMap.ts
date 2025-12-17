type SupplierSku = {
  supplierSku: string;
  internalSku: string;
};

const supplierMap = new Map<string, SupplierSku>();

export const poSupplierMap = {
  addMapping(supplierSku: string, internalSku: string) {
    supplierMap.set(supplierSku, { supplierSku, internalSku });
  },
  match(supplierSku: string) {
    return supplierMap.get(supplierSku)?.internalSku;
  },
};
