import { Router } from 'express';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Twilio from 'twilio';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ops@azteka.local';
const SOCKET_EVENT = 'automation:update';

let ioRef = null;
export const registerSocket = (io) => {
  ioRef = io;
};

const smtpTransporter =
  process.env.SMTP_HOST && process.env.SMTP_USER
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : null;

const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

const automationLog = [];

const pushLog = (entry) => {
  automationLog.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  if (automationLog.length > 50) {
    automationLog.pop();
  }
  if (ioRef) {
    ioRef.emit(SOCKET_EVENT, automationLog[0]);
  }
};

const runAutomationCycle = async () => {
  const start = Date.now();
  try {
    const headers = {
      Authorization: `Bearer ${process.env.AUTOMATION_TOKEN || ''}`,
    };

    const forecastRes = await fetch('http://localhost:4000/api/ai/forecast', {
      headers,
    });

    const forecastJson = forecastRes.ok ? await forecastRes.json() : { forecasts: [], aiSummary: '' };
    const lowStock = (forecastJson.forecasts || []).filter(
      (item) => item.projectedRunwayDays !== null && item.projectedRunwayDays <= 14
    );

    let poResult = null;
    if (lowStock.length > 0) {
      const poRes = await fetch('http://localhost:4000/api/po/create', {
        method: 'POST',
        headers,
      });
      poResult = poRes.ok ? await poRes.json() : null;
    }

    const summary = [
      `Automation cycle complete in ${Date.now() - start}ms.`,
      `${lowStock.length} low-stock SKUs detected.`,
      poResult ? 'Purchase orders were generated automatically.' : 'No PO generated this run.',
    ].join(' ');

    pushLog({
      type: 'success',
      summary,
      lowStock,
      aiSummary: forecastJson.aiSummary,
    });

    if (smtpTransporter) {
      await smtpTransporter.sendMail({
        from: `Azteka Automation <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_TO || ADMIN_EMAIL,
        subject: 'Nightly AI Forecast & PO Update',
        text: summary,
      });
    }

    if (twilioClient && process.env.TWILIO_FROM && process.env.TWILIO_TO) {
      await twilioClient.messages.create({
        from: process.env.TWILIO_FROM,
        to: process.env.TWILIO_TO,
        body: summary,
      });
    }

    return { lowStock, aiSummary: forecastJson.aiSummary };
  } catch (error) {
    console.error('Automation cycle failed', error);
    pushLog({
      type: 'error',
      summary: error.message || 'Unknown automation error',
    });
    return null;
  }
};

const TASK_SCHEDULE = process.env.AUTOMATION_CRON || '0 3 * * *';
cron.schedule(TASK_SCHEDULE, async () => {
  await runAutomationCycle();
});

router.get('/logs', (_req, res) => {
  res.json({
    logs: automationLog,
    schedule: TASK_SCHEDULE,
    nextRun: 'Runs daily at 3AM server time',
    emailEnabled: Boolean(smtpTransporter),
    smsEnabled: Boolean(twilioClient),
  });
});

router.post('/run', async (_req, res) => {
  const result = await runAutomationCycle();
  res.json({
    ok: true,
    result,
  });
});

export default router;
