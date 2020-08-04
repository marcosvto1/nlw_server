import db from '../database/connection';
import convertHourToMinutes from '../utils/convertHourToMinutes';
import { Request, Response } from 'express';


interface ScheduleItem {
    week_day: number,
    from: string;
    to: string;
}


export default class ClassesController {
    
    async index(req: Request, res: Response) {
        const filters = req.query;

        const subject = filters.subject as string;
        const week_day = filters.week_day as string;
        const time = filters.time as string;

        if (!filters.week_day || !filters.subject || !filters.time) {
            return res.status(400).json({
                error: 'Missing filters to search classes'
            });
        }

        const timeInMinutes = convertHourToMinutes(time);

        console.log(timeInMinutes);

        const classes = await db('classes')
            .whereExists(function() {
                this.select('class_schedule.*')
                .from('class_schedule')
                .whereRaw('`class_schedule`.`class_id` = `classes`.`id` ')
                .whereRaw('`class_schedule`.`week_day` = ??', [Number(week_day)])
                .whereRaw('`class_schedule`.`from` <= ??',[timeInMinutes])
                .whereRaw('`class_schedule`.`to` > ??',[timeInMinutes])
            })
            .where('classes.subject', '=', subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*'])

        return res.json(classes);
    }
    
    async create(req: Request, res: Response) {
        const {
            name,
            avatar,
            bio,
            whatsapp,
            subject,
            cost,
            schedule,
        } = req.body;
    
        const trx = await db.transaction();

        const insertedUsersIds = await trx('users').insert({
            name,
            avatar,
            bio,
            whatsapp
        });
    
        const user_id = insertedUsersIds[0];
    
        const insertedClassesIds = await trx('classes').insert({
            subject,
            cost,
            user_id
        });
    
        const class_id = insertedClassesIds[0];
    
        const classSchedule = schedule.map((item: ScheduleItem) => {
            return {
                class_id,
                week_day: item.week_day,
                from: convertHourToMinutes(item.from),
                to: convertHourToMinutes(item.to)
            };
        });
    
        await trx('class_schedule').insert(classSchedule);
    
        await trx.commit();
    
        return res.send();
    }

}