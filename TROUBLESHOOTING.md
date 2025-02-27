# Boardly Troubleshooting Guide

This document provides solutions for common issues you might encounter when running the Boardly application.

## Authentication Issues

### Boards Not Loading

If you're experiencing issues where boards are not loading on the dashboard:

1. **Check Authentication Status**:
   - Visit `/api/debug/auth` to verify your authentication status
   - Ensure you're properly authenticated with Clerk
   - Confirm your user exists in the database

2. **Check Boards API**:
   - Visit `/api/debug/boards` to check if your boards are being retrieved
   - Verify the count matches what you expect

3. **Clear Browser Cache and Cookies**:
   - Sometimes authentication tokens can become invalid
   - Clear your browser cache and cookies, then log in again

4. **Check Console Errors**:
   - Open your browser's developer tools (F12)
   - Look for any errors in the Console tab
   - Network tab can show failed API requests

## API Issues

### API Routes Not Working

If API routes are not working as expected:

1. **Check Middleware**:
   - The middleware might be blocking requests
   - Ensure your routes are properly configured in the middleware

2. **Verify Request Format**:
   - Make sure you're sending requests with the correct parameters
   - Check that query parameters are properly formatted

3. **Check Server Logs**:
   - Look at the server logs for any errors
   - Pay attention to authentication-related errors

## Database Issues

### Database Connection Problems

If you're experiencing database connection issues:

1. **Check Environment Variables**:
   - Ensure your database connection string is correct
   - Verify that all required environment variables are set

2. **Check Prisma Schema**:
   - Make sure your Prisma schema matches your database structure
   - Run `npx prisma generate` to update the Prisma client

3. **Verify Database Access**:
   - Ensure your database is running and accessible
   - Check firewall settings that might block connections

## Server Actions vs API Routes

After migrating from API routes to server actions, you might encounter these issues:

1. **Mixed Usage Issues**:
   - We're using server actions for mutations (create, update, delete)
   - We're still using API routes for queries (GET operations)
   - Make sure you're using the correct approach for each operation

2. **Caching Issues**:
   - Server actions use `revalidatePath` for cache invalidation
   - Ensure paths are being properly revalidated after mutations

3. **Type Safety**:
   - Server actions use Zod for validation
   - Make sure your data matches the expected schema

## React Query Issues

If you're experiencing issues with React Query:

1. **Query Keys**:
   - Ensure query keys are consistent across your application
   - Check that invalidation is using the correct keys

2. **Stale Data**:
   - Adjust `staleTime` and `cacheTime` settings if data seems outdated
   - Use `refetchOnWindowFocus` or `refetchInterval` for real-time updates

3. **Error Handling**:
   - Implement proper error handling in your query and mutation hooks
   - Use the `onError` callback to display error messages

## Development Environment

### Hot Reloading Issues

If hot reloading is not working properly:

1. **Restart Development Server**:
   - Stop and restart the development server
   - Run `npm run dev` to start a fresh server instance

2. **Check for File Watching Limits**:
   - On Linux systems, you might need to increase file watching limits
   - Run `echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`

3. **Clear Next.js Cache**:
   - Delete the `.next` folder and restart the development server
   - Run `rm -rf .next && npm run dev`

## Deployment Issues

If you're having issues with deployment:

1. **Environment Variables**:
   - Ensure all required environment variables are set in your deployment environment
   - Check for any environment-specific configurations

2. **Build Errors**:
   - Look for any build errors in your deployment logs
   - Fix any TypeScript or linting errors that might prevent successful builds

3. **API Routes vs Server Actions**:
   - Make sure your deployment platform supports both API routes and server actions
   - Some platforms might require specific configurations for server actions 