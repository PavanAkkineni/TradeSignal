# Deploy Trading Analytics Platform to Render.com

## ✅ What's Been Updated

Your project is now ready for deployment with:
- **Dockerfile**: Multi-stage build (Java 17 + Python 3.11)
- **render.yaml**: Render.com configuration
- **.dockerignore**: Optimized for smaller Docker images

## 🚀 Deployment Steps

### 1. Push to GitHub

```bash
cd "c:\Users\admin\Documents\JOB APP\FastAPI\TradeSignal"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Updated deployment configuration for Spring Boot + Python"

# Add remote (replace with your repo)
git remote add origin https://github.com/PavanAkkineni/TradeSignal.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy to Render.com

1. **Go to**: https://render.com
2. **Sign in** with your GitHub account
3. **Click**: "New +" → "Web Service"
4. **Connect**: Your GitHub repository `PavanAkkineni/TradeSignal`
5. **Render will auto-detect** your `render.yaml` file

### 3. Configure Environment Variables

In the Render dashboard, add these environment variables:

| Variable Name | Value | Required? |
|--------------|-------|-----------|
| `ALPHA_VANTAGE_API_KEY` | Your API key | ✅ Required |
| `GEMINI_API_KEY` | Your API key | ✅ Required |
| `NEWS_API_KEY` | Your API key | Optional |
| `FINNHUB_API_KEY` | Your API key | Optional |
| `POLYGON_API_KEY` | Your API key | Optional |

### 4. Deploy!

- Click **"Create Web Service"**
- Render will:
  - Build the Docker image (5-10 minutes)
  - Deploy to a free subdomain: `trading-analytics-platform.onrender.com`

## 📊 What Happens During Deployment

```
Stage 1: Maven Build (in Docker)
├── Copy pom.xml and dependencies
├── Build Spring Boot JAR
└── ~5 minutes

Stage 2: Runtime Image
├── Install Java 17 JRE
├── Install Python 3.11
├── Install Python packages (pandas, numpy, etc.)
├── Copy built JAR file
├── Copy Python scripts
└── Run on port 8080

Total Build Time: 8-12 minutes
```

## 🔍 Monitoring Deployment

Watch the build logs in Render dashboard:
- ✅ Green = Success
- ❌ Red = Error (check logs for details)

## 🎯 Access Your Deployed App

Once deployed, access at:
```
https://trading-analytics-platform.onrender.com
```

## ⚠️ Important Notes

### Free Tier Limitations
- **Cold Starts**: Free apps sleep after 15 mins of inactivity
- **First request**: Takes ~30 seconds to wake up
- **Monthly Hours**: 750 hours free per month

### Upgrade Options
- **Starter Plan ($7/mo)**: No cold starts, always active
- **Standard Plan ($25/mo)**: Better performance

## 🐛 Troubleshooting

### Build Fails?
1. Check Docker build logs
2. Verify `1java/pom.xml` exists
3. Ensure `requirements.txt` is valid

### App Won't Start?
1. Check environment variables are set
2. Verify API keys are correct
3. Review application logs

### Health Check Fails?
- Health check path: `/actuator/health`
- Should return `{"status":"UP"}`

## 📝 Post-Deployment

### Test Your Endpoints

```bash
# Health check
curl https://trading-analytics-platform.onrender.com/actuator/health

# Technical analysis
curl https://trading-analytics-platform.onrender.com/api/technical-analysis/IBM

# Fundamental analysis
curl https://trading-analytics-platform.onrender.com/api/fundamental-analysis/IBM
```

### Monitor Performance
- Render dashboard shows:
  - CPU/Memory usage
  - Request metrics
  - Error logs

## 🔄 Continuous Deployment

Every time you push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push
```

Render automatically:
1. Detects the push
2. Rebuilds the Docker image
3. Deploys the new version
4. Zero downtime deployment!

## 💡 Tips

1. **Use environment variables** for all API keys (never hardcode)
2. **Monitor free tier usage** to avoid surprises
3. **Add custom domain** (requires paid plan)
4. **Enable auto-deploy** for main branch only

## 📚 Resources

- [Render.com Docs](https://render.com/docs)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Spring Boot Docker](https://spring.io/guides/topicals/spring-boot-docker/)

---

**Ready to deploy!** 🚀 Push to GitHub and connect to Render.com!
