import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Eye, Clock, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  id: string;
  event_type: string;
  ip_address: string;
  user_agent: string;
  details: any;
  created_at: string;
  widget_id?: string;
}

interface SecurityStats {
  totalEvents: number;
  failedAuth: number;
  apiKeyFailures: number;
  suspiciousActivity: number;
  recentEvents: SecurityEvent[];
}

const SecurityMonitor = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    failedAuth: 0,
    apiKeyFailures: 0,
    suspiciousActivity: 0,
    recentEvents: []
  });
  const [loading, setLoading] = useState(true);

  const fetchSecurityData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get security events from the last 24 hours
      const { data: events, error } = await supabase
        .from('security_audit')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching security data:', error);
        return;
      }

      const securityEvents = events || [];
      
      // Calculate stats
      const totalEvents = securityEvents.length;
      const failedAuth = securityEvents.filter(e => 
        e.event_type === 'failed_login' || 
        e.event_type === 'invalid_token'
      ).length;
      
      const apiKeyFailures = securityEvents.filter(e => 
        e.event_type === 'widget_api_key_validation' && 
        e.details?.api_key_provided === false
      ).length;
      
      const suspiciousActivity = securityEvents.filter(e => 
        e.event_type === 'suspicious_activity' ||
        (e.ip_address && securityEvents.filter(s => s.ip_address === e.ip_address).length > 10)
      ).length;

      setStats({
        totalEvents,
        failedAuth,
        apiKeyFailures,
        suspiciousActivity,
        recentEvents: securityEvents.slice(0, 10)
      });

    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchSecurityData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'failed_login':
      case 'invalid_token':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'widget_api_key_validation':
        return <Shield className="h-4 w-4 text-warning" />;
      case 'suspicious_activity':
        return <Eye className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getEventSeverity = (event: SecurityEvent) => {
    if (event.event_type === 'failed_login' || event.event_type === 'suspicious_activity') {
      return 'high';
    }
    if (event.event_type === 'widget_api_key_validation' && !event.details?.api_key_provided) {
      return 'medium';
    }
    return 'low';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Auth</p>
                <p className="text-2xl font-bold text-destructive">{stats.failedAuth}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Key Failures</p>
                <p className="text-2xl font-bold text-warning">{stats.apiKeyFailures}</p>
              </div>
              <Shield className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspicious Activity</p>
                <p className="text-2xl font-bold text-destructive">{stats.suspiciousActivity}</p>
              </div>
              <Eye className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts for High Priority Issues */}
      {(stats.failedAuth > 5 || stats.suspiciousActivity > 0) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            High security activity detected in the last 24 hours. 
            {stats.failedAuth > 5 && ` ${stats.failedAuth} failed authentication attempts.`}
            {stats.suspiciousActivity > 0 && ` ${stats.suspiciousActivity} suspicious activities.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>
            Latest security events from the past 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No security events recorded in the last 24 hours
              </p>
            ) : (
              stats.recentEvents.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getEventIcon(event.event_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {formatEventType(event.event_type)}
                      </p>
                      <Badge 
                        variant={getEventSeverity(event) === 'high' ? 'destructive' : 
                                getEventSeverity(event) === 'medium' ? 'secondary' : 'outline'}
                      >
                        {getEventSeverity(event)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      IP: {event.ip_address || 'Unknown'} • 
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                    {event.details && Object.keys(event.details).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(event.details, null, 2)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitor;