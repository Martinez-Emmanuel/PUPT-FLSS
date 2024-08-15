import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Room {
  room_code: string;
  location: string;
  floor: string;
  room_type: string;
  capacity: number;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private roomsSubject = new BehaviorSubject<Room[]>([
    {
      room_code: 'A201',
      floor: '1st',
      location: 'Building A',
      room_type: 'Lecture',
      capacity: 50,
    },
    {
      room_code: 'A202',
      floor: '1st',
      location: 'Building A',
      room_type: 'Lecture',
      capacity: 50,
    },
    {
      room_code: 'A203',
      floor: '1st',
      location: 'Building A',
      room_type: 'Lecture',
      capacity: 50,
    },
    {
      room_code: 'A204',
      floor: '1st',
      location: 'Building A',
      room_type: 'Lecture',
      capacity: 50,
    },
    {
      room_code: 'A205',
      floor: '1st',
      location: 'Building A',
      room_type: 'Lecture',
      capacity: 50,
    },
    {
      room_code: 'DOSTLAB',
      floor: '1st',
      location: 'Building A',
      room_type: 'Lab',
      capacity: 60,
    },
    {
      room_code: 'ABOITIZLAB',
      floor: '1st',
      location: 'Building A',
      room_type: 'Lab',
      capacity: 60,
    },
    {
      room_code: 'B302',
      floor: '1st',
      location: 'Building B',
      room_type: 'Lab',
      capacity: 30,
    },
    {
      room_code: 'B303',
      floor: '1st',
      location: 'Building B',
      room_type: 'Lab',
      capacity: 30,
    },
    {
      room_code: 'B304',
      floor: '1st',
      location: 'Building B',
      room_type: 'Lab',
      capacity: 30,
    },
    {
      room_code: 'B305',
      floor: '1st',
      location: 'Building B',
      room_type: 'Lab',
      capacity: 30,
    },
    {
      room_code: 'B306',
      floor: '1st',
      location: 'Building B',
      room_type: 'Lab',
      capacity: 30,
    },
    {
      room_code: 'C101',
      floor: '1st',
      location: 'Building C',
      room_type: 'Lecture',
      capacity: 100,
    },
    {
      room_code: 'ENG101',
      floor: '1st',
      location: 'Engineering Building',
      room_type: 'Lecture',
      capacity: 50,
    },
    {
      room_code: 'ENG102',
      floor: '1st',
      location: 'Engineering Building',
      room_type: 'Lab',
      capacity: 60,
    },
    {
      room_code: 'ENG103',
      floor: '1st',
      location: 'Engineering Building',
      room_type: 'Lecture',
      capacity: 50,
    },
    {
      room_code: 'ENG104',
      floor: '1st',
      location: 'Engineering Building',
      room_type: 'Lab',
      capacity: 60,
    },
    {
      room_code: 'ENG105',
      floor: '1st',
      location: 'Engineering Building',
      room_type: 'Lecture',
      capacity: 50,
    },
  ]);

  getRooms(): Observable<Room[]> {
    return this.roomsSubject.asObservable().pipe();
  }

  addRoom(room: Room): Observable<Room[]> {
    const rooms = this.roomsSubject.getValue();
    this.roomsSubject.next([...rooms, room]);
    return of(this.roomsSubject.getValue());
  }

  updateRoom(index: number, updatedRoom: Room): Observable<Room[]> {
    const rooms = this.roomsSubject.getValue();
    rooms[index] = updatedRoom;
    this.roomsSubject.next([...rooms]);
    return of(this.roomsSubject.getValue());
  }

  deleteRoom(index: number): Observable<Room[]> {
    const rooms = this.roomsSubject.getValue();
    rooms.splice(index, 1);
    this.roomsSubject.next([...rooms]);
    return of(this.roomsSubject.getValue());
  }
}
