const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve landing page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Waitlist storage
const waitlist = [];

// Load existing waitlist if file exists
try {
    if (fs.existsSync('waitlist.json')) {
        const data = fs.readFileSync('waitlist.json', 'utf8');
        waitlist.push(...JSON.parse(data));
    }
} catch (error) {
    console.log('No existing waitlist found, starting fresh');
}

// API endpoint for waitlist
app.post('/api/waitlist', (req, res) => {
    const { email, role } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }
    
    // Check if already on waitlist
    if (waitlist.some(w => w.email === email)) {
        return res.json({ 
            message: 'Already on waitlist', 
            count: waitlist.length 
        });
    }
    
    waitlist.push({
        email,
        role: role || 'other',
        joinedAt: new Date().toISOString()
    });
    
    // Save to file
    fs.writeFileSync('waitlist.json', JSON.stringify(waitlist, null, 2));
    
    res.json({ 
        success: true, 
        message: 'Added to waitlist',
        count: waitlist.length 
    });
});

app.get('/api/waitlist/count', (req, res) => {
    res.json({ count: waitlist.length });
});

// Events data
const events = [
    {
        id: 'lagos-tech-summit-2024',
        name: 'Lagos Tech Summit 2024',
        lat: 6.5244,
        lng: 3.3792,
        radius: 100,
        startTime: new Date('2020-01-01').toISOString(),
        endTime: new Date('2030-12-31').toISOString(),
        active: true,
        image: 'https://via.placeholder.com/300/4CAF50/ffffff?text=Lagos+Tech+Summit'
    },
    {
        id: 'afro-nation-2024',
        name: 'Afro Nation Lagos 2024',
        lat: 6.4244,
        lng: 3.4192,
        radius: 200,
        startTime: new Date('2020-01-01').toISOString(),
        endTime: new Date('2030-12-31').toISOString(),
        active: true,
        image: 'https://via.placeholder.com/300/FF6B6B/ffffff?text=Afro+Nation'
    },
    {
        id: 'olumo-rock-tour',
        name: 'Olumo Rock Tour',
        lat: 7.0156,
        lng: 3.3019,
        radius: 150,
        startTime: new Date('2020-01-01').toISOString(),
        endTime: new Date('2030-12-31').toISOString(),
        active: true,
        image: 'https://via.placeholder.com/300/4A90E2/ffffff?text=Olumo+Rock'
    }
];

const claims = [];

// Helper: Calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

// API Routes
app.get('/api/events', (req, res) => {
    res.json(events.filter(e => e.active));
});

app.post('/api/verify-location', (req, res) => {
    const { lat, lng, eventId, wallet } = req.body;
    
    const event = events.find(e => e.id === eventId);
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }
    
    const distance = calculateDistance(lat, lng, event.lat, event.lng);
    const isValid = distance <= event.radius;
    
    const alreadyClaimed = claims.some(c => 
        c.wallet === wallet && c.eventId === eventId
    );
    
    res.json({
        valid: isValid,
        distance: Math.round(distance),
        event: event.name,
        message: isValid 
            ? alreadyClaimed 
                ? 'You already claimed this event!' 
                : '✅ You are at the event! Ready to claim your NFT.'
            : `❌ You are ${Math.round(distance)}m away. Need to be within ${event.radius}m.`,
        canClaim: isValid && !alreadyClaimed,
        eventImage: event.image
    });
});

app.post('/api/claim-nft', async (req, res) => {
    const { wallet, eventId, lat, lng } = req.body;
    
    try {
        const event = events.find(e => e.id === eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        const distance = calculateDistance(lat, lng, event.lat, event.lng);
        if (distance > event.radius) {
            return res.status(400).json({ 
                error: 'Not at event location',
                distance: Math.round(distance)
            });
        }
        
        if (claims.some(c => c.wallet === wallet && c.eventId === eventId)) {
            return res.status(400).json({ error: 'Already claimed' });
        }
        
        const nftResult = {
            mint: 'GeoNFT_' + Math.random().toString(36).substring(7),
            name: event.name,
            transaction: 'tx_' + Date.now()
        };
        
        const claim = {
            wallet,
            eventId,
            claimedAt: new Date().toISOString(),
            nftAddress: nftResult.mint,
            lat,
            lng,
            eventName: event.name,
            eventImage: event.image
        };
        claims.push(claim);
        
        res.json({
            success: true,
            message: `🎉 Success! You've claimed your ${event.name} NFT!`,
            nft: nftResult,
            claim
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/my-nfts/:wallet', (req, res) => {
    const { wallet } = req.params;
    const userClaims = claims.filter(c => c.wallet === wallet);
    res.json(userClaims);
});

// Dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n=================================');
    console.log('🚀 GeoVerify Nigeria - READY!');
    console.log('=================================');
    console.log(`📱 Landing Page: http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`📋 Waitlist API: http://localhost:${PORT}/api/waitlist`);
    console.log(`📈 Waitlist Count: ${waitlist.length} users`);
    console.log('=================================\n');
});
