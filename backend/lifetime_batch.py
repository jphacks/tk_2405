import datetime
import json
import logging
import os
import random
import sys
import site

import boto3
import psycopg2


logger = logging.getLogger()
logger.setLevel(logging.INFO)


def connect_db():
    conn = psycopg2.connect(
        host=os.environ["db_host"],
        dbname=os.environ["db_name"],
        port=os.environ["db_port"],
        user=os.environ["db_user"],
        password=os.environ["db_pass"]
    )
    logger.info("SUCCESS: Connection to RDS Aurora instance succeeded")
    return conn

def leave_users(room_id, cur):
    cur.execute(f"SELECT user_id FROM room_participants WHERE room_id = '{room_id}';")
    result = cur.fetchall()
    if result:
        for u in result:
            cur.execute(f"UPDATE users SET current_status = 0 WHERE user_id = '{u[0]}';")
            try:
                cur.execute(f"DELETE FROM room_participants WHERE user_id = '{u[0]}';")
            except Exception:
                pass


def lambda_handler(event, context):
    conn = connect_db()
    cur = conn.cursor()
    sql_statements = """SELECT 
        room_data.room_id,
        room_data.training_duration,
        room_data.training_strength,
        room_data.created_at,
        room_data.participant_count,
        room_data.remain_time
    FROM 
        (SELECT 
            r.room_id,
            r.training_duration,
            r.training_strength,
            r.created_at,
            COUNT(rp.participant_id) AS participant_count,
            r.training_duration - (EXTRACT(EPOCH FROM (NOW() - r.created_at)) / 60) AS remain_time
        FROM 
            rooms r
        LEFT JOIN 
            room_participants rp ON r.room_id = rp.room_id
        GROUP BY 
            r.room_id, r.training_duration, r.training_strength, r.created_at
        ) AS room_data
    WHERE 
        room_data.remain_time <= 0;
    """
    cur.execute(sql_statements)
    result = cur.fetchall()
    print("result", result)
    if result:
        for room in result:
            leave_users(room[0], cur)
            conn.commit()
        for room in result:
            cur.execute(f"DELETE FROM rooms WHERE room_id = {room[0]}")
        conn.commit()
    return {"statusCode": 200, "body": json.dumps("Done.")}
