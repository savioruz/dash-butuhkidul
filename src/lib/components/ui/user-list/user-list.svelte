<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Edit, Trash2, Plus, Users, Shield } from 'lucide-svelte';
	import type { User } from '$lib/types/user';
	import { USER_LEVEL_LABELS } from '$lib/types/user';
	import { t } from '$lib/i18n';
	import { getUserInfo } from '$lib/utils/jwt.js';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

	interface Props {
		users?: User[];
		isLoading?: boolean;
		onDelete?: (userId: string) => void;
		onAdd?: () => void;
		onEdit?: (user: User) => void;
		onChangeRole?: (user: User) => void;
	}

	let {
		users = [],
		isLoading = false,
		onDelete = () => {},
		onAdd = () => {},
		onEdit = () => {},
		onChangeRole = () => {}
	}: Props = $props();

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('id-ID');
	}

	function formatLastLogin(lastLogin?: string) {
		if (!lastLogin) {
			return $t('common.user.status.never_logged_in');
		}
		return new Date(lastLogin).toLocaleDateString('id-ID');
	}

	function getUserLevelLabel(level: string) {
		return USER_LEVEL_LABELS[level as keyof typeof USER_LEVEL_LABELS] || level;
	}

	function getStatusVariant(user: User) {
		if (!user.active) return 'destructive';
		if (!user.is_verified) return 'secondary';
		return 'default';
	}

	function getStatusLabel(user: User) {
		if (!user.active) return $t('common.status.inactive');
		if (!user.is_verified) return $t('common.user.status.unverified');
		return $t('common.status.active');
	}

	function isCurrentUser(user: User): boolean {
		const currentUser = getUserInfo();
		return currentUser ? currentUser.id === user.id : false;
	}
</script>

{#if isLoading}
	<div class="flex items-center justify-center py-8 text-muted-foreground">
		<div class="flex items-center gap-2">
			<div
				class="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"
			></div>
			{$t('common.loading')}
		</div>
	</div>
{:else if users.length === 0}
	<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
		<div class="text-center">
			<Users class="mx-auto h-12 w-12 text-muted-foreground" />
			<h3 class="text-lg font-medium">{$t('common.user.not_found')}</h3>
			<p class="mt-1 text-sm">{$t('common.user.not_found_description')}</p>
			<Button onclick={onAdd} class="mt-4">
				<Plus class="mr-2 h-4 w-4" />
				{$t('common.user.add')}
			</Button>
		</div>
	</div>
{:else}
	<div class="w-full overflow-hidden rounded-md border">
		<div class="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 overflow-x-auto">
			<table class="w-full text-sm">
				<thead class="bg-muted/50">
					<tr class="text-left">
						<th class="min-w-[180px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.user.fields.email')}</th
						>
						<th class="min-w-[150px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.user.fields.full_name')}</th
						>
						<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.user.fields.level')}</th
						>
						<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.user.table.status')}</th
						>
						<th class="min-w-[120px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.user.fields.last_login')}</th
						>
						<th class="min-w-[100px] p-2 font-medium whitespace-nowrap sm:p-3"
							>{$t('common.user.fields.created_at')}</th
						>
						<th class="min-w-[120px] p-2 text-right font-medium whitespace-nowrap sm:p-3"
							>{$t('common.user.fields.actions')}</th
						>
					</tr>
				</thead>
				<tbody>
					{#each users as user (user.id)}
						<tr class="border-t hover:bg-muted/30">
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								<div class="font-medium">{user.email}</div>
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								<div class="font-medium">{user.full_name}</div>
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								<Badge variant="outline">{getUserLevelLabel(user.level)}</Badge>
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								<Badge variant={getStatusVariant(user)}>
									{getStatusLabel(user)}
								</Badge>
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								{formatLastLogin(user.last_login)}
							</td>
							<td class="p-2 text-xs whitespace-nowrap sm:p-3 sm:text-sm">
								{formatDate(user.created_at)}
							</td>
							<td class="p-2 text-right whitespace-nowrap sm:p-3">
								<div class="flex items-center justify-end gap-1">
									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="icon" variant="ghost" onclick={() => onEdit(user)}>
													<Edit class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>{$t('common.user.edit')}</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>

									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button size="icon" variant="ghost" onclick={() => onChangeRole(user)}>
													<Shield class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>Change Role</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>

									<Tooltip.Provider>
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Button
													size="icon"
													variant="destructive"
													onclick={() => onDelete(user.id)}
													disabled={isCurrentUser(user)}
												>
													<Trash2 class="h-4 w-4" />
												</Button>
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>
													{isCurrentUser(user)
														? 'Cannot delete yourself'
														: $t('common.user.delete')}
												</p>
											</Tooltip.Content>
										</Tooltip.Root>
									</Tooltip.Provider>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="block border-t bg-muted/20 p-2 text-center text-xs text-muted-foreground sm:hidden">
			← Scroll to see more →
		</div>
	</div>
{/if}
