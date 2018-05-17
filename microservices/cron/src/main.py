from crontab import CronTab

# File name for cron
my_cron = CronTab(tabfile='my_cron.tab')

# Add cron command and time span
job  = my_cron.new(command='python /usr/src/app/save.py')
job.hour.every(12)

# Write cron jobs to cron tab file
my_cron.write()

# Run the scheduler
for result in my_cron.run_scheduler():
    print (result)
