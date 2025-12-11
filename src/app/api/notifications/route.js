import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';
import { Notification } from '@/models/Notification';

async function connectDB() {
    if (mongoose.connection.readyState === 0) {
        return mongoose.connect(process.env.MONGO_URL);
    }
}

// GET: Fetch notifications for the current user
export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const unreadOnly = searchParams.get('unread') === 'true';
        const limit = parseInt(searchParams.get('limit') || '20');

        let query = { userId: session.user.id };
        if (unreadOnly) {
            query.read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        // Get count of unread
        const unreadCount = await Notification.countDocuments({
            userId: session.user.id,
            read: false
        });

        return NextResponse.json({
            notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return NextResponse.json(
            { error: 'Error al obtener notificaciones' },
            { status: 500 }
        );
    }
}

// POST: Create a notification (Internal/Admin use)
export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        // Add stricter role check here if thisendpoint becomes public-facing admin only
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await connectDB();
        const data = await request.json();

        const notification = await Notification.create({
            ...data,
            // If no userId provided in body, default to current user? 
            // Or fail? For now, we expect userId in body to target specific users.
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        console.error('Error al crear notificación:', error);
        return NextResponse.json(
            { error: 'Error al crear notificación' },
            { status: 500 }
        );
    }
}

// PATCH: Mark as read
export async function PATCH(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await connectDB();
        const { notificationIds, markAllRead } = await request.json();

        if (markAllRead) {
            await Notification.updateMany(
                { userId: session.user.id, read: false },
                { $set: { read: true } }
            );
        } else if (notificationIds && Array.isArray(notificationIds)) {
            await Notification.updateMany(
                { _id: { $in: notificationIds }, userId: session.user.id },
                { $set: { read: true } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error al actualizar notificaciones:', error);
        return NextResponse.json(
            { error: 'Error al actualizar notificaciones' },
            { status: 500 }
        );
    }
}
