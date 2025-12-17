export function mapQBCustomerToAztekaCustomer(qbCustomer) {
  const name = qbCustomer.DisplayName || qbCustomer.FullyQualifiedName || 'Unknown Customer';
  const email = qbCustomer.PrimaryEmailAddr?.Address || `qb-${qbCustomer.Id}@placeholder.com`;
  const phone = qbCustomer.PrimaryPhone?.FreeFormNumber || '';
  const businessName = qbCustomer.CompanyName || name;

  const billingAddress = qbCustomer.BillAddr;
  const shippingAddress = qbCustomer.ShipAddr;

  return {
    name,
    email,
    phone,
    businessName,
    qbCustomerId: qbCustomer.Id,
    qbSyncToken: qbCustomer.SyncToken,
    role: 'CUSTOMER',
    qbData: {
      DisplayName: qbCustomer.DisplayName,
      CompanyName: qbCustomer.CompanyName,
      GivenName: qbCustomer.GivenName,
      FamilyName: qbCustomer.FamilyName,
      Balance: qbCustomer.Balance,
      BalanceWithJobs: qbCustomer.BalanceWithJobs,
      CurrencyRef: qbCustomer.CurrencyRef,
      Active: qbCustomer.Active,
      BillAddr: billingAddress
        ? {
            Line1: billingAddress.Line1,
            City: billingAddress.City,
            CountrySubDivisionCode: billingAddress.CountrySubDivisionCode,
            PostalCode: billingAddress.PostalCode,
            Country: billingAddress.Country,
          }
        : null,
      ShipAddr: shippingAddress
        ? {
            Line1: shippingAddress.Line1,
            City: shippingAddress.City,
            CountrySubDivisionCode: shippingAddress.CountrySubDivisionCode,
            PostalCode: shippingAddress.PostalCode,
            Country: shippingAddress.Country,
          }
        : null,
    },
  };
}

export function mapAztekaCustomerToQBCustomer(customer) {
  const qbCustomer = {
    DisplayName: customer.name,
    GivenName: customer.name.split(' ')[0],
    FamilyName: customer.name.split(' ').slice(1).join(' ') || customer.name.split(' ')[0],
    CompanyName: customer.businessName || customer.name,
    Active: true,
  };

  if (customer.email && !customer.email.includes('@placeholder.com')) {
    qbCustomer.PrimaryEmailAddr = {
      Address: customer.email,
    };
  }

  if (customer.phone) {
    qbCustomer.PrimaryPhone = {
      FreeFormNumber: customer.phone,
    };
  }

  if (customer.qbCustomerId) {
    qbCustomer.Id = customer.qbCustomerId;
  }

  if (customer.qbSyncToken) {
    qbCustomer.SyncToken = customer.qbSyncToken;
  }

  return qbCustomer;
}

export function compareCustomerSync(aztekaCustomer, qbCustomer) {
  const differences = [];

  if (aztekaCustomer.name !== qbCustomer.DisplayName) {
    differences.push({ field: 'name', azteka: aztekaCustomer.name, qb: qbCustomer.DisplayName });
  }

  const aztekaEmail = aztekaCustomer.email || '';
  const qbEmail = qbCustomer.PrimaryEmailAddr?.Address || '';
  if (aztekaEmail !== qbEmail && !aztekaEmail.includes('@placeholder.com')) {
    differences.push({ field: 'email', azteka: aztekaEmail, qb: qbEmail });
  }

  const aztekaPhone = aztekaCustomer.phone || '';
  const qbPhone = qbCustomer.PrimaryPhone?.FreeFormNumber || '';
  if (aztekaPhone !== qbPhone) {
    differences.push({ field: 'phone', azteka: aztekaPhone, qb: qbPhone });
  }

  return {
    inSync: differences.length === 0,
    differences,
  };
}

export function mergeCustomerData(aztekaCustomer, qbCustomer, strategy = 'qb-priority') {
  if (strategy === 'qb-priority') {
    return {
      ...aztekaCustomer,
      name: qbCustomer.DisplayName || aztekaCustomer.name,
      email: qbCustomer.PrimaryEmailAddr?.Address || aztekaCustomer.email,
      phone: qbCustomer.PrimaryPhone?.FreeFormNumber || aztekaCustomer.phone,
      businessName: qbCustomer.CompanyName || aztekaCustomer.businessName,
      qbCustomerId: qbCustomer.Id,
      qbSyncToken: qbCustomer.SyncToken,
    };
  }

  if (strategy === 'azteka-priority') {
    return {
      ...aztekaCustomer,
      qbCustomerId: qbCustomer.Id,
      qbSyncToken: qbCustomer.SyncToken,
    };
  }

  return aztekaCustomer;
}

export function extractCustomerAddress(qbCustomer, type = 'billing') {
  const addr = type === 'billing' ? qbCustomer.BillAddr : qbCustomer.ShipAddr;

  if (!addr) return null;

  return {
    street: addr.Line1 || '',
    city: addr.City || '',
    state: addr.CountrySubDivisionCode || '',
    postalCode: addr.PostalCode || '',
    country: addr.Country || 'US',
  };
}

