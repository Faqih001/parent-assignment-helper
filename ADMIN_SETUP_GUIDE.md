# Admin System Setup Guide

This guide explains how to set up and use the admin system for managing custom plans and users.

## Database Setup

1. **Run the Migration Script**
   - Open your Supabase dashboard
   - Go to the SQL Editor
   - Run the SQL script in `admin_setup_migration.sql`
   - This will create the necessary tables and policies

2. **Create Your First Admin User**
   - Register normally through the app with your admin email
   - In Supabase SQL Editor, run:

   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
   ```

## Admin Features

### Custom Plans Management

- **Create Plans**: Define custom pricing plans with specific question limits
- **Edit Plans**: Modify existing plans (price, questions, features)
- **Activate/Deactivate**: Control plan visibility
- **Delete Plans**: Remove plans permanently

### User Management

- **View All Users**: See all registered users and their details
- **Change User Plans**: Assign users to different plans
- **Grant Admin Access**: Promote users to admin role
- **Monitor Usage**: Track question usage across users

## Admin Dashboard Access

Once you're an admin user:

1. Log in to your account
2. Click on your avatar in the top right
3. Select "Admin Dashboard" from the dropdown
4. You'll have access to all admin features

## Plan Types

### Default Plans

- **Free Plan**: 5 questions daily, renewable
- **Family Plan**: 50 questions daily, KES 999/month
- **School Partnership**: Custom enterprise solution

### Custom Plans

Admins can create unlimited custom plans with:

- Custom pricing (in KES)
- Custom question limits
- Flexible billing periods
- Custom feature lists
- Active/inactive status

## User Roles

### User (Default)

- Access to chat functionality
- Plan-based question limits
- Standard features

### Admin

- All user features
- Admin dashboard access
- Custom plan management
- User management
- System oversight

## Enterprise/Custom Plan Workflow

1. **Customer Inquiry**: Customer contacts sales for enterprise needs
2. **Plan Creation**: Admin creates custom plan in dashboard
3. **User Assignment**: Admin assigns customer to custom plan
4. **Payment Setup**: Custom payment arrangements handled separately
5. **Monitoring**: Admin tracks usage and manages the relationship

## Security Features

- **Role-based Access**: Only admins can access admin features
- **Row Level Security**: Database policies ensure data protection
- **Audit Trail**: All custom plan changes are tracked
- **Secure Defaults**: New users default to 'user' role

## API Endpoints

The system uses these database helper functions:

- `createCustomPlan()` - Create new custom plans
- `updateCustomPlan()` - Modify existing plans
- `deleteCustomPlan()` - Remove plans
- `getCustomPlans()` - Fetch active plans
- `getAllUsers()` - Get all user profiles
- `updateUserPlan()` - Change user's plan
- `makeUserAdmin()` - Grant admin privileges

## Best Practices

1. **Plan Naming**: Use clear, descriptive names for custom plans
2. **Question Limits**: Set appropriate limits based on customer needs
3. **Pricing**: Ensure pricing reflects value and costs
4. **Features**: List specific features customers receive
5. **Admin Access**: Only grant admin access to trusted users
6. **Regular Reviews**: Periodically review and update plans

## Troubleshooting

### Common Issues

1. **Can't Access Admin Dashboard**
   - Verify user role is set to 'admin' in database
   - Check that migration script ran successfully

2. **Custom Plans Not Showing**
   - Ensure plans are marked as active
   - Check RLS policies are properly configured

3. **Permission Errors**
   - Verify user is authenticated
   - Check admin role assignment

### Support

For technical issues:

1. Check browser console for errors
2. Verify database connectivity
3. Review Supabase logs
4. Contact development team

## Future Enhancements

Potential additions:

- Plan analytics and reporting
- Automated billing integration
- Multi-tenant organization support
- Advanced user permissions
- Plan usage forecasting
