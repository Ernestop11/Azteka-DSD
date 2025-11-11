export { products, categories, weeklySpecials, brands, rackBundles } from './brandData';

export const mockUsers = [
  {
    id: 'admin-1',
    email: 'admin@azteka.com',
    password: 'admin123',
    name: 'Carlos Rodriguez',
    role: 'ADMIN',
  },
  {
    id: 'sales-1',
    email: 'sales@azteka.com',
    password: 'sales123',
    name: 'Maria Gonzalez',
    role: 'SALES_REP',
  },
  {
    id: 'driver-1',
    email: 'driver@azteka.com',
    password: 'driver123',
    name: 'Juan Martinez',
    role: 'DRIVER',
  },
];

export const mockUser = mockUsers[0];
