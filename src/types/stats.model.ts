// { userNames: string[]; viewCounts: number[]; totalSubmissions: number[]; minutesSaved: number[] }

// { userCount: number; viewCount: number; totalSubmissions: number; minutesSaved: number }

export type OverallStats = { userCount: number; viewCount: number; totalSubmissions: number; minutesSaved: number };

export type UserStat = { userName: string; viewCounts: number; totalSubmissions: number; minutesSaved: number };

type DBUserStat = { userNames: string[]; viewCounts: number[]; totalSubmissions: number[]; minutesSaved: number[] };

export function dbuserStatToUserStats(dbuserStat: DBUserStat): UserStat[] {
	let my: UserStat[] = [];
	for (let i = 0; i < dbuserStat.userNames[0].length; i++) {
		let { userNames, viewCounts, totalSubmissions, minutesSaved } = dbuserStat;
		my.push({ userName: userNames[i], viewCounts: viewCounts[i], totalSubmissions: totalSubmissions[i], minutesSaved: minutesSaved[i] });
	}
	return my;
}
