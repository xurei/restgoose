import * as jwt from 'jsonwebtoken';

export const baseUrl = `http://localhost:${process.env.NODE_PORT || 3000}`;

// Long lived tokens for automated testing on fake users
export const auth = {
    // Admin tokens
    // tslint:disable-next-line
    fakeadmin0: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEiLCJpYXQiOjE1MjM5NzY0OTIsImV4cCI6MjUyMzk4MDA5MH0.jtNbM2ucqka70tjiTEjnFqDAzqFMIMAJ8ij332h18fY',

    // User tokens
    // tslint:disable-next-line
    fakeuser0: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEiLCJpYXQiOjE1MjYzMDQ4MDMsImV4cCI6OTUyNjMwODQwM30.jvwREbvysxpuDENTDSKFJsEpp_Qmnx5V7oEL9eDzrAA',
    // tslint:disable-next-line
    fakeuser1: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDIiLCJpYXQiOjE1MjYzMDQ4MDMsImV4cCI6OTUyNjMwODQwM30.Trk0db_MvoXbA1KCmCumYV5atIYq2tvwan-YqywhPuQ',
    // tslint:disable-next-line
    fakeuser2: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDMiLCJpYXQiOjE1MjYzMDQ4MDMsImV4cCI6OTUyNjMwODQwM30.k8k0aSE4qpNC8S64CTOO0OHVyGhzIa7UeXJwIBQuCGM',

    // Incorrect token
    // tslint:disable-next-line
    wrongToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZW1wSWRlbnRpZmllciI6IjE4NDBkZDg4MTE3OWYzNzA0NzhlN2I1NzQ2NzE0MDg3YmJiNzUxNWE5OGIxMTMiLCJub25jZSI6ImMxODkzMDc1LTRiNTQtNGY0NS04YjZhLTllMTQ3ZjkwMGNkMCIsImlhdCI6MTUyMTU2OTE4MSwiZXhwIjoxNTIxNTY5MDgxfQ.dCCiHbEytiGYAHbNq2WY4ktVu1VJBSS8KWIBBlpV1FY',
};

export const identifiers = {
    // Identifiers stored in the long lived tokens. Used for checking the correctness of refresh tokens
    fakeadmin0: (jwt.decode(auth.fakeadmin0) as any).userId, // 00..01
    fakeuser0:  (jwt.decode(auth.fakeuser0 ) as any).userId, // 10..01
    fakeuser1:  (jwt.decode(auth.fakeuser1 ) as any).userId, // 10..02
    fakeuser2:  (jwt.decode(auth.fakeuser2 ) as any).userId, // 10..03
    wrongToken: (jwt.decode(auth.wrongToken) as any).userId,
};
