import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    const body = await request.json();

    // Build update data - only include fields that are provided
    const updateData: any = {};

    if ('isWeekendSpecial' in body) {
      updateData.isWeekendSpecial = Boolean(body.isWeekendSpecial);
    }

    if ('weekendPrice' in body) {
      updateData.weekendPrice = body.weekendPrice !== null && body.weekendPrice !== undefined
        ? parseFloat(String(body.weekendPrice))
        : null;
    }

    if ('weekendStartDate' in body) {
      updateData.weekendStartDate = body.weekendStartDate
        ? new Date(body.weekendStartDate)
        : null;
    }

    if ('weekendEndDate' in body) {
      updateData.weekendEndDate = body.weekendEndDate
        ? new Date(body.weekendEndDate)
        : null;
    }

    if ('displayOrder' in body) {
      updateData.displayOrder = parseInt(String(body.displayOrder)) || 0;
    }

    // Use raw SQL to update since Prisma client might not have these fields yet
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if ('isWeekendSpecial' in updateData) {
      updates.push(`"isWeekendSpecial" = $${paramIndex}`);
      values.push(updateData.isWeekendSpecial);
      paramIndex++;
    }

    if ('weekendPrice' in updateData) {
      updates.push(`"weekendPrice" = $${paramIndex}`);
      values.push(updateData.weekendPrice);
      paramIndex++;
    }

    if ('weekendStartDate' in updateData) {
      updates.push(`"weekendStartDate" = $${paramIndex}`);
      values.push(updateData.weekendStartDate);
      paramIndex++;
    }

    if ('weekendEndDate' in updateData) {
      updates.push(`"weekendEndDate" = $${paramIndex}`);
      values.push(updateData.weekendEndDate);
      paramIndex++;
    }

    if ('displayOrder' in updateData) {
      updates.push(`"displayOrder" = $${paramIndex}`);
      values.push(updateData.displayOrder);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updates.push(`"updatedAt" = NOW()`);
    values.push(productId);

    const query = `
      UPDATE "Product"
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, "isWeekendSpecial", "weekendPrice", "weekendStartDate", "weekendEndDate", "displayOrder"
    `;

    const result = await prisma.$queryRawUnsafe(query, ...values);

    return NextResponse.json({ success: true, product: result });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error?.message },
      { status: 500 }
    );
  }
}
