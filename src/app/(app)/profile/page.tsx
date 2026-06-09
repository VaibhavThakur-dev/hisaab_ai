'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Lock, Calendar, ShieldCheck, Pencil, X, Check } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import useProfileStore, { type ProfileData } from '@/stores/useProfileStore'

const nameSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type NameForm = z.infer<typeof nameSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const { profile, isLoading, setProfile, updateName, setLoading } = useProfileStore()

  // UI-only states — stay local
  const [editingName, setEditingName] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const nameForm = useForm<NameForm>({ resolver: zodResolver(nameSchema) })
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (profile) {
      nameForm.setValue('name', profile.name)
      // Sync session if DB name differs from JWT
      if (session && profile.name !== session.user?.name) {
        update({ name: profile.name })
      }
      return
    }
    setLoading(true)
    fetch('/api/profile')
      .then((r) => r.json())
      .then((j: { data: ProfileData }) => {
        if (j.data) {
          setProfile(j.data)
          nameForm.setValue('name', j.data.name)
          // Sync session with DB name on first load
          if (session && j.data.name !== session.user?.name) {
            update({ name: j.data.name })
          }
        }
      })
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const saveName = async (data: NameForm) => {
    setSavingName(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name }),
    })
    if (res.ok) {
      updateName(data.name)
      await update({ name: data.name })
      setEditingName(false)
      toast.success('Name updated')
    } else {
      const j = await res.json() as { error: string }
      toast.error(j.error)
    }
    setSavingName(false)
  }

  const savePassword = async (data: PasswordForm) => {
    setSavingPassword(true)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    })
    if (res.ok) {
      setChangingPassword(false)
      passwordForm.reset()
      toast.success('Password changed')
    } else {
      const j = await res.json() as { error: string }
      toast.error(j.error)
    }
    setSavingPassword(false)
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  const isGoogleUser = profile ? !profile.hasPassword : false
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="px-4 pt-6 pb-24 space-y-5">
      <h1 className="text-xl font-bold text-foreground">Profile</h1>

      {/* Avatar + name card */}
      {isLoading ? (
        <Skeleton className="h-28 rounded-2xl" />
      ) : (
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                <AvatarImage src={session?.user?.image ?? ''} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <form onSubmit={nameForm.handleSubmit(saveName)} className="flex items-center gap-2">
                    <Input autoFocus className="h-8 text-sm font-semibold" {...nameForm.register('name')} />
                    <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-primary" disabled={savingName}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0"
                      onClick={() => { setEditingName(false); nameForm.setValue('name', profile?.name ?? '') }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-foreground truncate">{profile?.name}</p>
                    <button onClick={() => setEditingName(true)} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {nameForm.formState.errors.name && (
                  <p className="text-xs text-destructive mt-0.5">{nameForm.formState.errors.name.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{profile?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account info */}
      {isLoading ? (
        <Skeleton className="h-24 rounded-2xl" />
      ) : (
        <Card className="rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Account Info</p>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{profile?.email}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member since</p>
                <p className="text-sm font-medium text-foreground">{joinedDate}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted shrink-0">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Login method</p>
                <p className="text-sm font-medium text-foreground">
                  {isGoogleUser ? 'Google account' : 'Email & password'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change password — only for credentials users */}
      {!isLoading && !isGoogleUser && (
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">Change Password</p>
              </div>
              {!changingPassword && (
                <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => setChangingPassword(true)}>
                  Change
                </Button>
              )}
            </div>

            {changingPassword && (
              <form onSubmit={passwordForm.handleSubmit(savePassword)} className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Current password</Label>
                  <Input type="password" className="h-9" {...passwordForm.register('currentPassword')} />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">New password</Label>
                  <Input type="password" className="h-9" {...passwordForm.register('newPassword')} />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Confirm new password</Label>
                  <Input type="password" className="h-9" {...passwordForm.register('confirmPassword')} />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" className="flex-1 h-9"
                    onClick={() => { setChangingPassword(false); passwordForm.reset() }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 h-9" disabled={savingPassword}>
                    {savingPassword ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </form>
            )}

            {!changingPassword && (
              <p className="text-xs text-muted-foreground">Keep your account secure</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Google user note */}
      {!isLoading && isGoogleUser && (
        <div className="flex items-start gap-2 px-1">
          <User className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            You signed in with Google. Password management is handled by your Google account.
          </p>
        </div>
      )}
    </div>
  )
}
