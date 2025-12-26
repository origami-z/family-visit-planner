import { useState } from 'react';
import { useFamilyPlanner } from '@/context/FamilyPlannerContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconPlus, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, isWithinInterval } from 'date-fns';
import { TripDialog } from './TripDialog';
import { Trip } from '@/types/planner';

export function CalendarView() {
  const { state } = useFamilyPlanner();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getTripsForDay = (date: Date) => {
    return state.trips.filter(trip => {
      const start = parseISO(trip.entryDate);
      const end = parseISO(trip.departureDate);
      return isWithinInterval(date, { start, end });
    });
  };

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTrip(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Calendar</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Add Trip
        </Button>
      </div>

      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">Monthly View</TabsTrigger>
          <TabsTrigger value="year">Yearly View</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon-sm" onClick={handlePrevMonth}>
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon-sm" onClick={handleNextMonth}>
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                
                {daysInMonth.map(day => {
                  const trips = getTripsForDay(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-24 p-2 border rounded-md ${
                        isSameMonth(day, currentDate) ? 'bg-card' : 'bg-muted/50'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">{format(day, 'd')}</div>
                      <div className="space-y-1">
                        {trips.map(trip => {
                          const member = state.members.find(m => m.id === trip.memberId);
                          if (!member) return null;
                          return (
                            <div
                              key={trip.id}
                              className="text-xs p-1 rounded cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: member.color, color: 'white' }}
                              onClick={() => handleEditTrip(trip)}
                              title={`${member.name}\n${trip.notes || ''}`}
                            >
                              {member.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="year" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 12 }).map((_, monthIdx) => {
              const monthDate = new Date(currentDate.getFullYear(), monthIdx, 1);
              const start = startOfMonth(monthDate);
              const end = endOfMonth(monthDate);
              const days = eachDayOfInterval({ start, end });
              
              return (
                <Card key={monthIdx}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{format(monthDate, 'MMMM')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i} className="text-center text-xs text-muted-foreground">
                          {day}
                        </div>
                      ))}
                      
                      {Array.from({ length: start.getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}
                      
                      {days.map(day => {
                        const trips = getTripsForDay(day);
                        const colors = trips.map(t => state.members.find(m => m.id === t.memberId)?.color).filter(Boolean);
                        
                        return (
                          <div
                            key={day.toISOString()}
                            className="aspect-square flex items-center justify-center text-xs rounded relative"
                            style={{
                              background: colors.length > 0 
                                ? colors.length === 1 
                                  ? colors[0]
                                  : `linear-gradient(135deg, ${colors.join(', ')})`
                                : 'transparent',
                              color: colors.length > 0 ? 'white' : 'inherit'
                            }}
                          >
                            {format(day, 'd')}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <TripDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        trip={editingTrip}
      />
    </div>
  );
}