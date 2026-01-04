import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - List surveys for customer
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params

    const surveys = await prisma.customerSurvey.findMany({
      where: { customerId },
      orderBy: { surveyDate: 'desc' },
      take: 20
    })

    return NextResponse.json({
      surveys: surveys.map(s => ({
        id: s.id,
        surveyDate: s.surveyDate.toISOString(),
        conductedById: s.conductedById,
        satisfactionScore: s.satisfactionScore,
        serviceQuality: s.serviceQuality,
        deliveryRating: s.deliveryRating,
        productQuality: s.productQuality,
        pricingFairness: s.pricingFairness,
        notes: s.notes,
        productFeedback: s.productFeedback,
        improvementSuggestions: s.improvementSuggestions,
        followUpRequired: s.followUpRequired,
        followUpCompleted: s.followUpCompleted,
        createdAt: s.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('[Customer Surveys GET] Error:', error)
    return NextResponse.json({ error: 'Failed to load surveys' }, { status: 500 })
  }
}

// POST - Create new survey
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.satisfactionScore || !body.serviceQuality) {
      return NextResponse.json(
        { error: 'satisfactionScore and serviceQuality are required' },
        { status: 400 }
      )
    }

    // Validate scores are 1-5
    const scores = [
      body.satisfactionScore,
      body.serviceQuality,
      body.deliveryRating,
      body.productQuality,
      body.pricingFairness
    ].filter(Boolean)

    if (scores.some(s => s < 1 || s > 5)) {
      return NextResponse.json(
        { error: 'Scores must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true }
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const survey = await prisma.customerSurvey.create({
      data: {
        customerId,
        conductedById: body.conductedById || 'unknown',
        satisfactionScore: body.satisfactionScore,
        serviceQuality: body.serviceQuality,
        deliveryRating: body.deliveryRating || null,
        productQuality: body.productQuality || null,
        pricingFairness: body.pricingFairness || null,
        notes: body.notes || null,
        productFeedback: body.productFeedback || null,
        improvementSuggestions: body.improvementSuggestions || null,
        followUpRequired: body.followUpRequired || false
      }
    })

    // Update customer's lastVisitDate since we're doing a survey
    await prisma.customer.update({
      where: { id: customerId },
      data: { lastVisitDate: new Date() }
    })

    return NextResponse.json({
      survey: {
        id: survey.id,
        surveyDate: survey.surveyDate.toISOString(),
        satisfactionScore: survey.satisfactionScore,
        serviceQuality: survey.serviceQuality
      }
    })
  } catch (error) {
    console.error('[Customer Surveys POST] Error:', error)
    return NextResponse.json({ error: 'Failed to create survey' }, { status: 500 })
  }
}
